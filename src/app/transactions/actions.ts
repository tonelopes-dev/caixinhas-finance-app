
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { TransactionService, AccountService, GoalService, CategoryService } from '@/services';
import { invalidateReportCache } from '../reports/actions';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';


const transactionSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, { message: 'A descrição é obrigatória.' }),
  amount: z.string()
    .min(1, { message: 'Valor é obrigatório.' })
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val > 0, { message: 'O valor deve ser positivo.' }),
  type: z.enum(['income', 'expense', 'transfer'], { required_error: 'O tipo é obrigatório.' }),
  category: z.string().min(1, { message: 'A categoria é obrigatória.' }),
  date: z.string().optional(),
  sourceAccountId: z.string().optional().nullable(),
  destinationAccountId: z.string().optional().nullable(),
  goalId: z.string().optional().nullable(),
  paymentMethod: z.enum(['pix', 'credit_card', 'debit_card', 'transfer', 'boleto', 'cash']).optional().nullable(),
  isRecurring: z.boolean().optional(),
  isInstallment: z.boolean().optional(),
  installmentNumber: z.coerce.number().optional(),
  totalInstallments: z.coerce.number().optional(),
  actorId: z.string().optional(),
  userId: z.string().optional(),
  vaultId: z.string().optional(),
}).refine(data => {
    if (data.type === 'expense' && !data.sourceAccountId) return false;
    if (data.type === 'income' && !data.destinationAccountId) return false;
    if (data.type === 'transfer' && !data.sourceAccountId && !data.destinationAccountId) return false;
    return true;
}, {
    message: "A conta de origem e/ou destino é necessária dependendo do tipo de transação.",
    path: ['sourceAccountId'],
});


export type TransactionState = {
  success: boolean;
  message?: string | null;
  errors?: Record<string, string[] | undefined>;
}

export async function addTransaction(prevState: TransactionState, formData: FormData): Promise<TransactionState> {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) {
    return { success: false, message: 'Usuário não autenticado.' };
  }
  const userId = session.user.id;

  const chargeType = formData.get('chargeType');
  const ownerId = formData.get('ownerId') as string;
  const isPersonal = ownerId === userId;
  
  const sourceId = formData.get('sourceAccountId') as string | null;
  const destinationId = formData.get('destinationAccountId') as string | null;

  const rawData = {
    description: formData.get('description'),
    amount: formData.get('amount'),
    type: formData.get('type'),
    category: formData.get('category'),
    date: formData.get('date') || new Date().toISOString(),
    // Lógica corrigida para diferenciar conta de meta
    sourceAccountId: sourceId && !sourceId.startsWith('goal-') ? sourceId : null,
    destinationAccountId: destinationId && !destinationId.startsWith('goal-') ? destinationId : null,
    goalId: (sourceId?.startsWith('goal-') ? sourceId : destinationId?.startsWith('goal-') ? destinationId : null)?.replace('goal-', ''),
    paymentMethod: formData.get('paymentMethod') || null,
    isRecurring: chargeType === 'recurring',
    isInstallment: chargeType === 'installment',
    installmentNumber: formData.get('installmentNumber'),
    totalInstallments: formData.get('totalInstallments'),
    actorId: userId,
    userId: isPersonal ? userId : undefined,
    vaultId: !isPersonal ? ownerId : undefined,
  };

  const validatedFields = transactionSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.log("Validation Errors:", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Falha na validação. Por favor, verifique os campos.',
    };
  }
  
  try {
    await TransactionService.createTransaction(validatedFields.data as any);
    
    // As operações de invalidação e revalidação são secundárias, mas importantes.
    // As encapsulamos em um try/catch para não quebrar a experiência principal.
    try {
        await invalidateReportCache(validatedFields.data.date, ownerId);
        revalidatePath('/');
        revalidatePath('/transactions');
        revalidatePath('/reports');
        if (validatedFields.data.goalId) {
            revalidatePath(`/goals/${validatedFields.data.goalId}`);
        }
    } catch (secondaryError) {
        console.warn("Aviso: Falha na operação secundária (cache/revalidação):", secondaryError);
    }
    
    return { success: true, message: 'Transação adicionada com sucesso!' };

  } catch(error) {
     console.error('Erro ao criar transação:', error);
     return { success: false, message: 'Ocorreu um erro no servidor ao salvar a transação.' };
  }
}

export async function updateTransaction(prevState: TransactionState, formData: FormData): Promise<TransactionState> {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) {
    return { success: false, message: 'Usuário não autenticado.' };
  }

  const chargeType = formData.get('chargeType');
  
  const sourceId = formData.get('sourceAccountId') as string | null;
  const destinationId = formData.get('destinationAccountId') as string | null;

  const rawData = {
    id: formData.get('id'),
    description: formData.get('description'),
    amount: formData.get('amount'),
    type: formData.get('type'),
    category: formData.get('category'),
    date: formData.get('date'),
    // Lógica corrigida para diferenciar conta de meta
    sourceAccountId: sourceId && !sourceId.startsWith('goal-') ? sourceId : null,
    destinationAccountId: destinationId && !destinationId.startsWith('goal-') ? destinationId : null,
    goalId: (sourceId?.startsWith('goal-') ? sourceId : destinationId?.startsWith('goal-') ? destinationId : null)?.replace('goal-', ''),
    paymentMethod: formData.get('paymentMethod'),
    isRecurring: chargeType === 'recurring',
    isInstallment: chargeType === 'installment',
    installmentNumber: formData.get('installmentNumber'),
    totalInstallments: formData.get('totalInstallments'),
  };

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

  try {
    const originalTransaction = await TransactionService.getTransactionById(id);
    if (!originalTransaction) {
        return { success: false, message: 'Erro: Transação não encontrada.' };
    }

    await TransactionService.updateTransaction(id, data as any);
    
    try {
        await invalidateReportCache(originalTransaction.date.toISOString(), originalTransaction.vaultId || originalTransaction.userId);
        if(data.date && originalTransaction.date.toISOString() !== data.date) {
            await invalidateReportCache(data.date, originalTransaction.vaultId || originalTransaction.userId);
        }
        
        revalidatePath('/');
        revalidatePath('/transactions');
        revalidatePath('/reports');
        if (originalTransaction.goalId) revalidatePath(`/goals/${originalTransaction.goalId}`);
        if (data.goalId) revalidatePath(`/goals/${data.goalId}`);
    } catch (secondaryError) {
        console.warn("Aviso: Falha na operação secundária (cache/revalidação):", secondaryError);
    }
    
    return { success: true, message: 'Transação atualizada com sucesso!' };

  } catch(error) {
     console.error('Erro ao atualizar transação:', error);
     return { success: false, message: 'Ocorreu um erro no servidor ao atualizar a transação.' };
  }
}

export async function deleteTransaction(prevState: { message: string | null }, formData: FormData): Promise<{ message: string | null, success: boolean }> {
  const deleteTransactionSchema = z.object({
    id: z.string(),
  });
  const validatedFields = deleteTransactionSchema.safeParse({
    id: formData.get('id'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'ID da transação inválido.',
    };
  }
  
  const { id } = validatedFields.data;
  
  try {
    const deletedTransaction = await TransactionService.getTransactionById(id);
    if (deletedTransaction) {
        await TransactionService.deleteTransaction(id);
        
        try {
            await invalidateReportCache(deletedTransaction.date.toISOString(), deletedTransaction.vaultId || deletedTransaction.userId);
            revalidatePath('/');
            revalidatePath('/transactions');
            revalidatePath('/reports');
            if (deletedTransaction.goalId) revalidatePath(`/goals/${deletedTransaction.goalId}`);
        } catch (secondaryError) {
            console.warn("Aviso: Falha na operação secundária (cache/revalidação):", secondaryError);
        }

        return { success: true, message: 'Transação excluída com sucesso!' };
    }
    return { success: false, message: 'Erro: Transação não encontrada.' };
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    return { success: false, message: 'Ocorreu um erro no servidor ao deletar a transação.' };
  }
}
