/**
 * POST /api/bot/auth/confirm-link
 *
 * Confirma a vinculação Telegram ↔ Caixinhas usando o PIN enviado por e-mail.
 *
 * Edge Cases:
 * - PIN expirado → 410 (Gone)
 * - PIN incorreto → 401 (máx 5 tentativas, depois invalida)
 * - Nenhum PIN pendente para o email → 404
 * - telegramChatId divergente do solicitado → 400
 * - Sucesso → Atualiza User.telegramChatId no banco
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateBotRequest } from '../../middleware';
import { prisma } from '@/services/prisma';
import { pinStore, hashPin, MAX_ATTEMPTS } from '../request-link/route';

export async function POST(request: NextRequest) {
  // 1. Validar API Key
  const authError = validateBotRequest(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { email, code, telegramChatId } = body;

    // 2. Validar payload
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Campo "email" é obrigatório.' },
        { status: 400 }
      );
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Campo "code" é obrigatório.' },
        { status: 400 }
      );
    }

    if (!telegramChatId || typeof telegramChatId !== 'string') {
      return NextResponse.json(
        { error: 'Campo "telegramChatId" é obrigatório.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = code.trim();

    // 3. Buscar PIN pendente
    const pending = pinStore.get(normalizedEmail);

    if (!pending) {
      return NextResponse.json(
        { error: 'Nenhum código pendente para este e-mail. Solicite um novo código.' },
        { status: 404 }
      );
    }

    // 4. Verificar expiração
    if (Date.now() > pending.expiresAt) {
      pinStore.delete(normalizedEmail);
      return NextResponse.json(
        { error: 'O código expirou. Solicite um novo código de verificação.' },
        { status: 410 }
      );
    }

    // 5. Verificar se o telegramChatId confere com o da solicitação original
    if (pending.telegramChatId !== telegramChatId) {
      return NextResponse.json(
        { error: 'O telegramChatId não corresponde ao da solicitação original. Solicite um novo código.' },
        { status: 400 }
      );
    }

    // 6. Verificar número de tentativas
    if (pending.attempts >= MAX_ATTEMPTS) {
      pinStore.delete(normalizedEmail);
      return NextResponse.json(
        { error: 'Número máximo de tentativas excedido. Solicite um novo código.' },
        { status: 429 }
      );
    }

    // 7. Verificar o código PIN
    const hashedInput = hashPin(normalizedCode);

    if (hashedInput !== pending.pin) {
      pending.attempts++;
      const remaining = MAX_ATTEMPTS - pending.attempts;

      console.warn(`⚠️ [Bot Auth] PIN incorreto para ${normalizedEmail}. Tentativas restantes: ${remaining}`);

      return NextResponse.json(
        {
          error: `Código incorreto. Você tem mais ${remaining} tentativa${remaining !== 1 ? 's' : ''}.`,
          remainingAttempts: remaining,
        },
        { status: 401 }
      );
    }

    // 8. ✅ PIN correto! Vincular telegramChatId ao usuário
    try {
      const updatedUser = await prisma.user.update({
        where: { email: normalizedEmail },
        data: { telegramChatId },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          subscriptionStatus: true,
        },
      });

      // Limpar o PIN usado
      pinStore.delete(normalizedEmail);

      console.log(`✅ [Bot Auth] Telegram vinculado: ${normalizedEmail} → chatId ${telegramChatId}`);

      return NextResponse.json({
        success: true,
        message: `Conta vinculada com sucesso! Bem-vindo(a), ${updatedUser.name}! 🎉`,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          avatarUrl: updatedUser.avatarUrl,
          subscriptionStatus: updatedUser.subscriptionStatus,
        },
      });
    } catch (dbError: any) {
      // Unique constraint violation — outro user já vinculou esse chatId enquanto o PIN estava pendente
      if (dbError?.code === 'P2002') {
        pinStore.delete(normalizedEmail);
        return NextResponse.json(
          { error: 'Este Telegram já foi vinculado a outra conta durante o processo. Tente novamente.' },
          { status: 409 }
        );
      }

      throw dbError;
    }
  } catch (error) {
    console.error('❌ [Bot Auth] Erro em confirm-link:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
