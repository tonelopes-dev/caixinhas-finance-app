
'use server';

import { authOptions } from '@/lib/auth';
import { TransactionService, type CreateTransactionInput } from '@/services/transaction.service';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { invalidateReportCache } from '../reports/actions';


// ---------------------------------------------------------------------------
// Schema de validação
// ---------------------------------------------------------------------------

const transactionSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, { message: 'A descrição é obrigatória.' }),
  amount: z.coerce.number().positive({ message: 'O valor deve ser positivo.' }),
  type: z.enum(['income', 'expense', 'transfer'], { required_error: 'O tipo é obrigatório.' }),
  category: z.string().min(1, { message: 'A categoria é obrigatória.' }),
  date: z.string().optional(),
  sourceAccountId: z.string().optional().nullable(),
  destinationAccountId: z.string().optional().nullable(),
  goalId: z.string().optional().nullable(),
  paymentMethod: z.enum(['pix', 'credit_card', 'debit_card', 'transfer', 'boleto', 'cash']).optional().nullable(),
  isRecurring: z.boolean().optional(),
  isInstallment: z.boolean().optional(),
  installmentNumber: z.coerce.number().optional().nullable(),
  totalInstallments: z.coerce.number().optional().nullable(),
  paidInstallments: z.union([
    z.array(z.number()), 
    z.number(), 
    z.string()
  ]).optional().nullable().transform(val => {
    if (typeof val === 'number') return [];
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return val || [];
  }),
  actorId: z.string().optional(),
  userId: z.string().optional(),
  vaultId: z.string().optional(),
  projectRecurring: z.boolean().optional(),
}).refine(data => {
    const hasSource = !!data.sourceAccountId || !!data.goalId;
    const hasDestination = !!data.destinationAccountId || !!data.goalId;

    if (data.type === 'expense') return hasSource;
    if (data.type === 'income') return hasDestination;
    if (data.type === 'transfer') return hasSource && hasDestination;
    return true;
}, {
    message: "A conta de origem e/ou destino é necessária dependendo do tipo de transação.",
    path: ['sourceAccountId'],
});


// ---------------------------------------------------------------------------
// Tipo de retorno compartilhado
// ---------------------------------------------------------------------------

export type TransactionState = {
  success: boolean;
  message?: string | null;
  errors?: Record<string, string[] | undefined>;
}


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extrai e normaliza os dados do FormData da UI para o formato do schema.
 * Lida com a convenção `goal-{id}` e o cálculo de valor de parcelas.
 */
function parseTransactionFormData(formData: FormData, userId: string) {
  const ownerId = formData.get('ownerId') as string;
  const isPersonal = ownerId === userId;

  const sourceValue = formData.get('sourceAccountId') as string | null;
  const destinationValue = formData.get('destinationAccountId') as string | null;

  const processedData = {
    description: formData.get('description'),
    amount: formData.get('amount'),
    type: formData.get('type'),
    category: formData.get('category'),
    date: formData.get('date') || new Date().toISOString(),
    sourceAccountId: sourceValue && !sourceValue.startsWith('goal-') ? sourceValue : null,
    destinationAccountId: destinationValue && !destinationValue.startsWith('goal-') ? destinationValue : null,
    goalId: sourceValue?.startsWith('goal-') 
        ? sourceValue.replace('goal-', '') 
        : (destinationValue?.startsWith('goal-') ? destinationValue.replace('goal-', '') : null),
    paymentMethod: formData.get('paymentMethod') || null,
    isRecurring: formData.get('chargeType') === 'recurring',
    isInstallment: formData.get('chargeType') === 'installment',
    installmentNumber: formData.get('installmentNumber') || (formData.get('chargeType') === 'installment' ? 1 : null),
    totalInstallments: formData.get('totalInstallments'),
    paidInstallments: formData.get('chargeType') === 'installment' ? [] : null,
    projectRecurring: formData.get('projectRecurring') === 'true',
    actorId: userId,
    userId: isPersonal ? userId : undefined,
    vaultId: !isPersonal ? ownerId : undefined,
  };

  // Se for parcelado, o valor recebido é o TOTAL. Converter para valor da PARCELA.
  if (processedData.isInstallment && processedData.totalInstallments) {
    const total = parseFloat(processedData.amount as string);
    const installments = parseInt(processedData.totalInstallments as string);
    if (!isNaN(total) && !isNaN(installments) && installments > 0) {
      processedData.amount = (total / installments).toFixed(2);
    }
  }

  return { processedData, ownerId };
}

/**
 * Extrai e normaliza os dados do FormData de edição.
 */
function parseUpdateFormData(formData: FormData) {
  const sourceValue = formData.get('sourceAccountId') as string | null;
  const destinationValue = formData.get('destinationAccountId') as string | null;

  return {
    id: formData.get('id'),
    description: formData.get('description'),
    amount: formData.get('amount'),
    type: formData.get('type'),
    category: formData.get('category'),
    date: formData.get('date'),
    sourceAccountId: sourceValue && !sourceValue.startsWith('goal-') ? sourceValue : null,
    destinationAccountId: destinationValue && !destinationValue.startsWith('goal-') ? destinationValue : null,
    goalId: sourceValue?.startsWith('goal-') 
        ? sourceValue.replace('goal-', '') 
        : (destinationValue?.startsWith('goal-') ? destinationValue.replace('goal-', '') : null),
    paymentMethod: formData.get('paymentMethod'),
    isRecurring: formData.get('chargeType') === 'recurring',
    isInstallment: formData.get('chargeType') === 'installment',
    installmentNumber: formData.get('installmentNumber'),
    totalInstallments: formData.get('totalInstallments'),
    paidInstallments: formData.get('paidInstallments'),
  };
}

/**
 * Invalida TODAS as rotas que podem ter sido afetadas por uma mutação de transação.
 * 
 * Por quê cada rota?
 * - `/transactions` — A lista de transações mudou.
 * - `/dashboard` — Os saldos, gráficos e transações recentes mudaram.
 * - `/reports` — Os relatórios mensais podem estar desatualizados.
 * - `/recurring` — Se a transação era recorrente/parcelada, a lista mudou.
 * - `/goals/{id}` — Se a transação envolve uma caixinha, o saldo da goal mudou.
 * - `/accounts` — Saldos de contas bancárias foram atualizados.
 * - `layout` — Força rerenderização do layout compartilhado (sidebar/header com saldos).
 */
async function revalidateTransactionCaches(opts: {
  dateIso?: string;
  ownerId?: string;
  goalId?: string | null;
  previousGoalId?: string | null;
}) {
  // Report cache (assíncrono, falha silenciosa)
  try {
    await invalidateReportCache(opts.dateIso, opts.ownerId);
  } catch (e) {
    console.warn('Aviso: Falha ao invalidar cache de relatórios:', e);
  }

  // Rotas que SEMPRE devem ser revalidadas em qualquer mutação de transação
  revalidatePath('/', 'layout');
  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  revalidatePath('/reports');
  revalidatePath('/recurring');
  revalidatePath('/accounts');

  // Rotas condicionais — só se a transação envolve uma goal
  if (opts.goalId) {
    revalidatePath('/goals');
    revalidatePath(`/goals/${opts.goalId}`);
  }
  if (opts.previousGoalId && opts.previousGoalId !== opts.goalId) {
    revalidatePath(`/goals/${opts.previousGoalId}`);
  }
}


// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/**
 * Cria uma nova transação.
 * Fluxo: Autenticação → Parsing → Validação Zod → Service → Cache → Retorno.
 */
export async function addTransaction(
  _prevState: TransactionState,
  formData: FormData
): Promise<TransactionState> {
  // 1. Autenticação
  const { requireFullAccess } = await import('@/lib/action-helpers');
  const accessCheck = await requireFullAccess();
  if (!accessCheck.success || !accessCheck.data) {
    return { success: false, message: accessCheck.error || 'Acesso negado.' };
  }
  const userId = accessCheck.data.id;

  // 2. Parsing do FormData
  const { processedData, ownerId } = parseTransactionFormData(formData, userId);

  // 3. Validação Zod
  const validatedFields = transactionSchema.safeParse(processedData);
  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Falha na validação. Por favor, verifique os campos.',
    };
  }

  // 4. Chamar o serviço (que já é atômico e gerencia saldos)
  try {
    const { date, actorId, installmentNumber, totalInstallments, ...rest } = validatedFields.data;
    const serviceInput: CreateTransactionInput = {
      ...rest,
      date: date ? new Date(date) : new Date(),
      actorId: actorId || userId,
      installmentNumber: installmentNumber ?? undefined,
      totalInstallments: totalInstallments ?? undefined,
    };
    await TransactionService.createTransaction(serviceInput);
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    return { success: false, message: 'Ocorreu um erro no servidor ao salvar a transação.' };
  }

  // 5. Invalidar caches
  await revalidateTransactionCaches({
    dateIso: validatedFields.data.date,
    ownerId,
    goalId: validatedFields.data.goalId,
  });

  return { success: true, message: 'Transação adicionada com sucesso!' };
}

/**
 * Atualiza uma transação existente.
 * O TransactionService já faz compensação de saldos (reverse → update → apply).
 * A action só precisa orquestrar parsing, validação, chamada e cache.
 */
export async function updateTransaction(
  _prevState: TransactionState,
  formData: FormData
): Promise<TransactionState> {
  // 1. Autenticação
  const session = await getServerSession(authOptions);
  if (!session?.user.id) {
    return { success: false, message: 'Usuário não autenticado.' };
  }

  const ownerId = formData.get('ownerId') as string;

  // 2. Parsing
  const rawData = parseUpdateFormData(formData);

  // 3. Validação Zod
  const validatedFields = transactionSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Falha na validação. Por favor, verifique os campos.',
    };
  }

  const { id, ...data } = validatedFields.data;
  if (!id) {
    return { success: false, message: 'Erro: ID da transação não encontrado.' };
  }

  // 4. Buscar original (para saber a goalId antiga e a data antiga para cache)
  let previousGoalId: string | null = null;
  let previousDateIso: string | undefined;

  try {
    const original = await TransactionService.getTransactionById(id);
    if (!original) {
      return { success: false, message: 'Erro: Transação não encontrada.' };
    }
    previousGoalId = original.goalId ?? null;
    previousDateIso = original.date.toISOString();

    // 5. Chamar o serviço (que já faz reverse → update → apply internamente)
    const { date: dateStr, installmentNumber: instNum, totalInstallments: totalInst, ...updateRest } = data;
    await TransactionService.updateTransaction(id, {
      ...updateRest,
      date: dateStr ? new Date(dateStr) : undefined,
      installmentNumber: instNum ?? undefined,
      totalInstallments: totalInst ?? undefined,
    });
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    return { success: false, message: 'Ocorreu um erro no servidor ao atualizar a transação.' };
  }

  // 6. Invalidar caches (ambas as datas se mudou de mês)
  await revalidateTransactionCaches({
    dateIso: previousDateIso,
    ownerId,
    goalId: data.goalId,
    previousGoalId,
  });

  // Se a data mudou, invalidar o relatório do novo mês também
  if (data.date && previousDateIso !== data.date) {
    try {
      await invalidateReportCache(data.date, ownerId);
    } catch (e) {
      console.warn('Aviso: Falha ao invalidar cache do novo mês:', e);
    }
  }

  return { success: true, message: 'Transação atualizada com sucesso!' };
}

/**
 * Exclui uma transação.
 * O TransactionService já reverte saldos automaticamente.
 */
export async function deleteTransaction(
  _prevState: { message: string | null },
  formData: FormData
): Promise<{ message: string | null; success: boolean }> {
  // 1. Validação mínima
  const id = formData.get('id') as string | null;
  if (!id) {
    return { success: false, message: 'ID da transação inválido.' };
  }

  // 2. Buscar a transação antes de deletar (para informações de cache)
  let dateIso: string | undefined;
  let ownerId: string | undefined;
  let goalId: string | null = null;

  try {
    const transaction = await TransactionService.getTransactionById(id);
    if (!transaction) {
      return { success: false, message: 'Erro: Transação não encontrada.' };
    }

    dateIso = transaction.date.toISOString();
    ownerId = transaction.vaultId || transaction.userId || undefined;
    goalId = transaction.goalId ?? null;

    // 3. Chamar o serviço (que já reverte saldos dentro de $transaction)
    await TransactionService.deleteTransaction(id);
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    return { success: false, message: 'Ocorreu um erro no servidor ao deletar a transação.' };
  }

  // 4. Invalidar caches
  await revalidateTransactionCaches({ dateIso, ownerId, goalId });

  return { success: true, message: 'Transação excluída com sucesso!' };
}
