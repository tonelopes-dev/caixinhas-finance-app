/**
 * Bot API Middleware — Validação de segurança para rotas /api/bot/*
 *
 * Verifica estritamente o header `X-Bot-API-Key` contra a variável de ambiente `BOT_API_KEY`.
 * Retorna `null` se a chave é válida, ou um `NextResponse 401` para rejeitar a requisição.
 *
 * Uso em qualquer route handler:
 * ```ts
 * const authError = validateBotRequest(request);
 * if (authError) return authError;
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Valida se a requisição contém uma API Key válida para o bot.
 * @returns `null` se válida, `NextResponse(401)` se inválida.
 */
export function validateBotRequest(request: NextRequest): NextResponse | null {
  const BOT_API_KEY = process.env.BOT_API_KEY;

  // 1. Garantir que a variável de ambiente existe (falha de configuração)
  if (!BOT_API_KEY || BOT_API_KEY.length < 32) {
    console.error('❌ [Bot Middleware] BOT_API_KEY não configurada ou muito curta (mín. 32 chars).');
    return NextResponse.json(
      { error: 'Erro de configuração do servidor.' },
      { status: 500 }
    );
  }

  // 2. Extrair o header da requisição
  const providedKey = request.headers.get('X-Bot-API-Key');

  if (!providedKey) {
    console.warn('⚠️ [Bot Middleware] Requisição sem header X-Bot-API-Key.');
    return NextResponse.json(
      { error: 'Não autorizado. Header X-Bot-API-Key ausente.' },
      { status: 401 }
    );
  }

  // 3. Comparação em tempo constante para prevenir timing attacks
  if (!timingSafeEqual(providedKey, BOT_API_KEY)) {
    console.warn('⚠️ [Bot Middleware] API Key inválida recebida.');
    return NextResponse.json(
      { error: 'Não autorizado. API Key inválida.' },
      { status: 401 }
    );
  }

  // ✅ Requisição autorizada
  return null;
}

/**
 * Comparação de strings em tempo constante usando XOR.
 * Previne ataques de timing side-channel.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
