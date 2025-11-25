
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { TransactionService } from '@/services/transaction.service';
import { AccountService } from '@/services/account.service';
import { GoalService } from '@/services/goal.service';
import { CategoryService } from '@/services/category.service';
import { invalidateReportCache } from '../reports/actions';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';


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

    if (data.type === 'expense') {
        return hasSource;
    }
    if (data.type === 'income') {
        return hasDestination;
    }
    if (data.type === 'transfer') {
        return hasSource && hasDestination;
    }
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
    installmentNumber: formData.get('installmentNumber'),
    totalInstallments: formData.get('totalInstallments'),
    paidInstallments: formData.get('chargeType') === 'installment' ? [] : null,
    projectRecurring: formData.get('projectRecurring') === 'true',
    actorId: userId,
    userId: isPersonal ? userId : undefined,
    vaultId: !isPersonal ? ownerId : undefined,
  };
  
  const validatedFields = transactionSchema.safeParse(processedData);

  if (!validatedFields.success) {
    console.log("--- DEBUG: ERRO DE VALIDAÇÃO ---");
    console.log(JSON.stringify(validatedFields.error.flatten().fieldErrors, null, 2));
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Falha na validação. Por favor, verifique os campos.',
    };
  }
  
  try {
    await TransactionService.createTransaction(validatedFields.data as any);
    
    try {
        await invalidateReportCache(validatedFields.data.date, ownerId);
        revalidatePath('/', 'layout');
        revalidatePath('/transactions');
        revalidatePath('/dashboard');
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

  const ownerId = formData.get('ownerId') as string;
  const sourceValue = formData.get('sourceAccountId') as string | null;
  const destinationValue = formData.get('destinationAccountId') as string | null;

  const rawData = {
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
    paidInstallments: formData.get('paidInstallments')
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
        await invalidateReportCache(originalTransaction.date.toISOString(), ownerId);
        if(data.date && originalTransaction.date.toISOString() !== data.date) {
            await invalidateReportCache(data.date, ownerId);
        }
        
        revalidatePath('/', 'layout');
        revalidatePath('/transactions');
        revalidatePath('/dashboard');
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
            revalidatePath('/dashboard');
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
