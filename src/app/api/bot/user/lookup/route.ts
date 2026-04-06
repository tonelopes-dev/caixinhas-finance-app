/**
 * POST /api/bot/user/lookup
 *
 * Busca um usuário pelo telegramChatId.
 * Retorna dados básicos do usuário ou 404 se não encontrado.
 *
 * Esta rota é chamada pelo n8n para identificar o usuário no início de cada conversa.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateBotRequest } from '../../middleware';
import { prisma } from '@/services/prisma';

export async function POST(request: NextRequest) {
  // 1. Validar API Key
  const authError = validateBotRequest(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { telegramChatId } = body;

    // 2. Validar payload
    if (!telegramChatId || typeof telegramChatId !== 'string') {
      return NextResponse.json(
        { error: 'Campo "telegramChatId" é obrigatório e deve ser uma string.' },
        { status: 400 }
      );
    }

    // 3. Buscar usuário com dados essenciais para o bot
    const user = await prisma.user.findUnique({
      where: { telegramChatId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        subscriptionStatus: true,
        trialExpiresAt: true,
        createdAt: true,
        // Dados extras úteis para o bot contextualizar respostas
        ownedAccounts: {
          select: {
            id: true,
            name: true,
            bank: true,
            type: true,
            balance: true,
            creditLimit: true,
          },
          orderBy: { name: 'asc' },
        },
        categories: {
          select: {
            id: true,
            name: true,
          },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Nenhuma conta vinculada a este Telegram. Use /vincular para conectar sua conta.' },
        { status: 404 }
      );
    }

    // 4. Verificar status de acesso
    const isAccessActive =
      user.subscriptionStatus === 'active' ||
      (user.subscriptionStatus === 'trial' && user.trialExpiresAt && new Date(user.trialExpiresAt) > new Date());

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        subscriptionStatus: user.subscriptionStatus,
        isAccessActive,
        accounts: user.ownedAccounts,
        categories: user.categories.map((c) => c.name),
      },
    });
  } catch (error) {
    console.error('❌ [Bot User] Erro em lookup:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
