/**
 * POST /api/bot/auth/request-link
 *
 * Fluxo de vinculação do Telegram → Caixinhas.
 * Recebe o email do usuário e o telegramChatId, gera um PIN de 6 dígitos
 * e envia por e-mail para confirmação.
 *
 * Edge Cases:
 * - Email não cadastrado → 404
 * - telegramChatId já vinculado a OUTRO email → 409 (previne roubo de conta)
 * - Rate limit: máximo 3 PINs por telegramChatId em 15 min (anti-spam)
 * - PIN armazenado em memória com TTL (sem Redis, sem tabela extra)
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateBotRequest } from '../../middleware';
import { AuthService } from '@/services/auth.service';
import { prisma } from '@/services/prisma';
import { sendEmail } from '@/lib/email.service';
import { telegramPinEmail } from '@/app/_templates/emails/telegram-pin-email';
import crypto from 'crypto';

// ---------------------------------------------------------------------------
// In-Memory PIN Store (produção: substituir por Redis ou tabela no banco)
// ---------------------------------------------------------------------------

interface PendingPin {
  pin: string;            // PIN hasheado (SHA-256)
  email: string;
  telegramChatId: string;
  expiresAt: number;      // timestamp em ms
  attempts: number;       // tentativas de validação (max 5)
}

// Map<email, PendingPin>
const pinStore = new Map<string, PendingPin>();

// Map<telegramChatId, { count, windowStart }>
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

// Constantes
const PIN_TTL_MS = 15 * 60 * 1000;        // 15 minutos
const MAX_ATTEMPTS = 5;                     // Tentativas de validação por PIN
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 min window
const RATE_LIMIT_MAX = 3;                   // Max 3 PINs por window

// Limpeza periódica de PINs expirados (a cada 5 min)
setInterval(() => {
  const now = Date.now();
  for (const [key, pin] of pinStore.entries()) {
    if (pin.expiresAt < now) pinStore.delete(key);
  }
  for (const [key, rl] of rateLimitStore.entries()) {
    if (rl.windowStart + RATE_LIMIT_WINDOW_MS < now) rateLimitStore.delete(key);
  }
}, 5 * 60 * 1000);


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generatePin(): string {
  // Gera 6 dígitos criptograficamente seguros
  const bytes = crypto.randomBytes(3); // 3 bytes = 24 bits → até 16777215
  const num = bytes.readUIntBE(0, 3) % 1000000;
  return num.toString().padStart(6, '0');
}

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin).digest('hex');
}


// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // 1. Validar API Key
  const authError = validateBotRequest(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { email, telegramChatId } = body;

    // 2. Validar payload
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Campo "email" é obrigatório e deve ser uma string.' },
        { status: 400 }
      );
    }

    if (!telegramChatId || typeof telegramChatId !== 'string') {
      return NextResponse.json(
        { error: 'Campo "telegramChatId" é obrigatório e deve ser uma string.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 3. Rate limit por telegramChatId
    const now = Date.now();
    const rl = rateLimitStore.get(telegramChatId);

    if (rl) {
      if (now - rl.windowStart < RATE_LIMIT_WINDOW_MS) {
        if (rl.count >= RATE_LIMIT_MAX) {
          console.warn(`⚠️ [Bot Auth] Rate limit atingido para telegramChatId: ${telegramChatId}`);
          return NextResponse.json(
            { error: 'Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.' },
            { status: 429 }
          );
        }
        rl.count++;
      } else {
        // Janela expirou, resetar
        rateLimitStore.set(telegramChatId, { count: 1, windowStart: now });
      }
    } else {
      rateLimitStore.set(telegramChatId, { count: 1, windowStart: now });
    }

    // 4. Verificar se o email existe no sistema
    const user = await AuthService.getUserByEmail(normalizedEmail);

    if (!user) {
      return NextResponse.json(
        { error: 'Nenhuma conta encontrada com esse e-mail. Cadastre-se primeiro em caixinhas.app' },
        { status: 404 }
      );
    }

    // 5. Verificar se esse telegramChatId já está vinculado a OUTRA conta
    const existingLink = await prisma.user.findUnique({
      where: { telegramChatId },
      select: { id: true, email: true },
    });

    if (existingLink) {
      if (existingLink.id === user.id) {
        // Já vinculado a este mesmo usuário → OK, informar
        return NextResponse.json(
          { error: 'Este Telegram já está vinculado à sua conta Caixinhas. Não é necessário vincular novamente.' },
          { status: 409 }
        );
      }
      // Vinculado a OUTRO usuário → Roubo de conta impedido
      console.warn(`🚨 [Bot Auth] Tentativa de vincular telegramChatId ${telegramChatId} que já pertence a ${existingLink.email}`);
      return NextResponse.json(
        { error: 'Este Telegram já está vinculado a outra conta. Desvincule primeiro na conta atual.' },
        { status: 409 }
      );
    }

    // 6. Verificar se o usuário já tem um telegramChatId DIFERENTE vinculado
    if (user.id) {
      const userRecord = await prisma.user.findUnique({
        where: { id: user.id },
        select: { telegramChatId: true },
      });
      if (userRecord?.telegramChatId && userRecord.telegramChatId !== telegramChatId) {
        return NextResponse.json(
          { error: 'Sua conta já está vinculada a outro Telegram. Desvincule primeiro antes de vincular a um novo.' },
          { status: 409 }
        );
      }
    }

    // 7. Gerar PIN e salvar
    const rawPin = generatePin();
    const hashedPin = hashPin(rawPin);

    pinStore.set(normalizedEmail, {
      pin: hashedPin,
      email: normalizedEmail,
      telegramChatId,
      expiresAt: now + PIN_TTL_MS,
      attempts: 0,
    });

    // 8. Enviar e-mail com PIN
    try {
      const emailHtml = telegramPinEmail(user.name, rawPin);
      await sendEmail({
        to: normalizedEmail,
        subject: '🔐 Código de Verificação — Caixinhas + Telegram',
        html: emailHtml,
      });

      console.log(`✅ [Bot Auth] PIN enviado para ${normalizedEmail}`);
    } catch (emailError) {
      // Se falhar ao enviar e-mail, limpar o PIN
      pinStore.delete(normalizedEmail);
      console.error('❌ [Bot Auth] Falha ao enviar e-mail:', emailError);
      return NextResponse.json(
        { error: 'Falha ao enviar o código de verificação. Tente novamente.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Código de verificação enviado para ${normalizedEmail}. Válido por 15 minutos.`,
    });
  } catch (error) {
    console.error('❌ [Bot Auth] Erro em request-link:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Exports para uso no confirm-link
// ---------------------------------------------------------------------------

export { pinStore, hashPin, MAX_ATTEMPTS };
