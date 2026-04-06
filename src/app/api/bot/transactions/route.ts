/**
 * POST /api/bot/transactions
 *
 * Rota blindada para criação de transações via bot do Telegram.
 * Valida o payload estritamente com Zod antes de chamar o TransactionService.
 *
 * Edge Cases:
 * - Payload incompleto ou com tipos errados → 400 com mensagem clara
 * - Valor negativo ou zero → 400
 * - Despesa sem sourceAccountId → 400
 * - Receita sem destinationAccountId → 400
 * - Transfer sem source + dest / goalId → 400
 * - Usuário não encontrado pelo telegramChatId → 404
 * - Acesso inativo (subscription) → 403
 * - Erro do TransactionService → 500 com mensagem descritiva
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateBotRequest } from '../middleware';
import { prisma } from '@/services/prisma';
import { TransactionService } from '@/services/transaction.service';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Schema Zod — Validação rígida do payload do bot
// ---------------------------------------------------------------------------

const botTransactionSchema = z
  .object({
    telegramChatId: z.string().min(1, 'telegramChatId é obrigatório.'),

    description: z.string().min(1, 'A descrição é obrigatória.').max(200, 'Descrição muito longa (máx 200 chars).'),

    amount: z
      .number({ invalid_type_error: 'O valor (amount) deve ser um número.' })
      .positive('O valor deve ser positivo. O sistema não aceita valores negativos ou zero.'),

    type: z.enum(['income', 'expense', 'transfer'], {
      errorMap: () => ({ message: 'O tipo deve ser "income", "expense" ou "transfer".' }),
    }),

    category: z.string().min(1, 'A categoria é obrigatória.'),

    date: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          const d = new Date(val);
          return !isNaN(d.getTime());
        },
        { message: 'Data inválida. Use o formato ISO 8601 (ex: 2025-04-05T12:00:00Z).' }
      ),

    paymentMethod: z
      .enum(['pix', 'credit_card', 'debit_card', 'transfer', 'boleto', 'cash'])
      .optional()
      .nullable(),

    sourceAccountId: z.string().optional().nullable(),
    destinationAccountId: z.string().optional().nullable(),
    goalId: z.string().optional().nullable(),

    // Contexto: se deve usar workspace pessoal ou cofre
    vaultId: z.string().optional().nullable(),

    isRecurring: z.boolean().optional().default(false),
    isInstallment: z.boolean().optional().default(false),
    installmentNumber: z.number().int().positive().optional().nullable(),
    totalInstallments: z.number().int().positive().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    // Validações cruzadas com mensagens claras para a IA
    if (data.type === 'expense' && !data.sourceAccountId && !data.goalId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Para despesas, informe a conta de origem (sourceAccountId). Pergunte ao usuário de qual conta ele quer debitar.',
        path: ['sourceAccountId'],
      });
    }

    if (data.type === 'income' && !data.destinationAccountId && !data.goalId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Para receitas, informe a conta de destino (destinationAccountId). Pergunte ao usuário em qual conta ele quer receber.',
        path: ['destinationAccountId'],
      });
    }

    if (data.type === 'transfer') {
      const hasSource = !!data.sourceAccountId || !!data.goalId;
      const hasDest = !!data.destinationAccountId || !!data.goalId;

      if (!hasSource || !hasDest) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Para transferências, informe a conta de origem E destino (ou goalId para caixinhas). Pergunte ao usuário de onde para onde ele quer transferir.',
          path: ['sourceAccountId'],
        });
      }
    }

    if (data.isInstallment && (!data.totalInstallments || data.totalInstallments < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Para parcelamentos, informe totalInstallments com valor >= 2.',
        path: ['totalInstallments'],
      });
    }
  });


// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // 1. Validar API Key
  const authError = validateBotRequest(request);
  if (authError) return authError;

  try {
    const body = await request.json();

    // 2. Validar payload com Zod
    const validation = botTransactionSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      return NextResponse.json(
        {
          error: 'Dados inválidos para criar a transação.',
          details: errors,
          // Mensagem amigável para a IA repassar ao usuário
          userMessage: errors.map((e) => e.message).join(' '),
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 3. Identificar usuário pelo telegramChatId
    const user = await prisma.user.findUnique({
      where: { telegramChatId: data.telegramChatId },
      select: {
        id: true,
        name: true,
        subscriptionStatus: true,
        trialExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Nenhuma conta vinculada a este Telegram. Use /vincular para conectar sua conta.' },
        { status: 404 }
      );
    }

    // 4. Verificar acesso ativo
    const isAccessActive =
      user.subscriptionStatus === 'active' ||
      (user.subscriptionStatus === 'trial' && user.trialExpiresAt && new Date(user.trialExpiresAt) > new Date());

    if (!isAccessActive) {
      return NextResponse.json(
        {
          error: 'Sua assinatura está inativa ou seu período de teste expirou. Renove em caixinhas.app para continuar usando o bot.',
        },
        { status: 403 }
      );
    }

    // 5. Validar que as contas pertencem ao usuário (se fornecidas)
    if (data.sourceAccountId) {
      const account = await prisma.account.findUnique({
        where: { id: data.sourceAccountId },
        select: { ownerId: true },
      });
      if (!account || account.ownerId !== user.id) {
        return NextResponse.json(
          { error: 'A conta de origem informada não pertence ao seu usuário ou não existe.' },
          { status: 400 }
        );
      }
    }

    if (data.destinationAccountId) {
      const account = await prisma.account.findUnique({
        where: { id: data.destinationAccountId },
        select: { ownerId: true },
      });
      if (!account || account.ownerId !== user.id) {
        return NextResponse.json(
          { error: 'A conta de destino informada não pertence ao seu usuário ou não existe.' },
          { status: 400 }
        );
      }
    }

    // 6. Validar goalId se fornecido
    if (data.goalId) {
      const goal = await prisma.goal.findUnique({
        where: { id: data.goalId },
        select: { userId: true, vaultId: true },
      });
      if (!goal) {
        return NextResponse.json(
          { error: 'A caixinha (goalId) informada não existe.' },
          { status: 400 }
        );
      }
      // Verificar ownership
      if (goal.userId !== user.id && !goal.vaultId) {
        return NextResponse.json(
          { error: 'Você não tem permissão para operar nesta caixinha.' },
          { status: 403 }
        );
      }
    }

    // 7. Criar transação via service (operação atômica — saldos atualizados automaticamente)
    try {
      const transaction = await TransactionService.createTransaction({
        userId: data.vaultId ? undefined : user.id,
        vaultId: data.vaultId || undefined,
        date: data.date ? new Date(data.date) : new Date(),
        description: data.description,
        amount: data.amount,
        type: data.type,
        category: data.category,
        actorId: user.id,
        paymentMethod: data.paymentMethod || undefined,
        sourceAccountId: data.sourceAccountId || undefined,
        destinationAccountId: data.destinationAccountId || undefined,
        goalId: data.goalId || undefined,
        isRecurring: data.isRecurring,
        isInstallment: data.isInstallment,
        installmentNumber: data.installmentNumber ?? undefined,
        totalInstallments: data.totalInstallments ?? undefined,
      });

      console.log(`✅ [Bot Transaction] Transação criada: ${transaction.id} por ${user.name}`);

      return NextResponse.json({
        success: true,
        message: `Transação "${data.description}" de R$ ${data.amount.toFixed(2)} registrada com sucesso!`,
        transaction: {
          id: transaction.id,
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          date: transaction.date,
        },
      });
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : 'Erro desconhecido';
      console.error('❌ [Bot Transaction] Erro no TransactionService:', serviceError);

      return NextResponse.json(
        {
          error: `Falha ao criar a transação: ${errorMessage}`,
          userMessage: `Não foi possível registrar a transação. Motivo: ${errorMessage}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ [Bot Transaction] Erro geral:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
