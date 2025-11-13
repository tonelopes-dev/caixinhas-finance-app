
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { TransactionService } from '@/services';
import { invalidateReportCache } from '../reports/actions';
import { cookies } from 'next/headers';

const transactionSchema = z.object({
  id: z.string().optional(),
  ownerId: z.string(),
  ownerType: z.enum(['user', 'vault']),
  description: z.string().min(1, { message: 'A descrição é obrigatória.' }),
  amount: z.coerce.number().positive({ message: 'O valor deve ser positivo.' }),
  type: z.enum(['income', 'expense', 'transfer'], { required_error: 'O tipo é obrigatório.' }),
  category: z.string().min(1, { message: 'A categoria é obrigatória.' }),
  date: z.string().optional(),
  sourceAccountId: z.string().optional().nullable(),
  destinationAccountId: z.string().optional().nullable(),
  paymentMethod: z.enum(['pix', 'credit_card', 'debit_card', 'transfer', 'boleto', 'cash']).optional(),
  isRecurring: z.boolean().optional(),
  isInstallment: z.boolean().optional(),
  installmentNumber: z.coerce.number().optional(),
  totalInstallments: z.coerce.number().optional(),
}).refine(data => {
    if (data.type === 'expense' && !data.sourceAccountId) return false;
    if (data.type === 'income' && !data.destinationAccountId) return false;
    if (data.type === 'transfer' && (!data.sourceAccountId || !data.destinationAccountId)) return false;
    return true;
}, {
    message: "A conta de origem e/ou destino é necessária dependendo do tipo de transação.",
    path: ['sourceAccountId'], // Assign error to a relevant field
}).refine(data => {
    if (data.isInstallment) {
        return data.installmentNumber && data.totalInstallments && data.installmentNumber <= data.totalInstallments;
    }
    return true;
}, {
    message: "Número de parcelas inválido.",
    path: ['installmentNumber'],
});


const deleteTransactionSchema = z.object({
  id: z.string(),
});


export type TransactionState = {
  success: boolean;
  message?: string | null;
  errors?: Record<string, string[] | undefined>;
}

export async function addTransaction(prevState: TransactionState, formData: FormData): Promise<TransactionState> {
  const cookieStore = cookies();
  const userId = cookieStore.get('CAIXINHAS_USER_ID')?.value;
  
  if (!userId) {
    return { success: false, message: 'Usuário não autenticado.' };
  }

  const chargeType = formData.get('chargeType');
  const ownerId = formData.get('ownerId') as string;
  const ownerType = ownerId === userId ? 'user' : 'vault';

  const rawData = {
    ownerId,
    ownerType,
    description: formData.get('description'),
    amount: formData.get('amount'),
    type: formData.get('type'),
    category: formData.get('category'),
    date: formData.get('date') || new Date().toISOString(),
    sourceAccountId: formData.get('sourceAccountId') || null,
    destinationAccountId: formData.get('destinationAccountId') || null,
    paymentMethod: formData.get('paymentMethod'),
    isRecurring: chargeType === 'recurring',
    isInstallment: chargeType === 'installment',
    installmentNumber: formData.get('installmentNumber'),
    totalInstallments: formData.get('totalInstallments'),
    actorId: userId,
  };
  
  const validatedFields = transactionSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Falha na validação. Por favor, verifique os campos.',
    };
  }
  
  try {
    await TransactionService.createTransaction(validatedFields.data as any);
    await invalidateReportCache(validatedFields.data.date, validatedFields.data.ownerId);

    revalidatePath('/');
    revalidatePath('/transactions');
    revalidatePath('/reports');
    if (validatedFields.data.destinationAccountId?.startsWith('goal')) {
        revalidatePath(`/goals/${validatedFields.data.destinationAccountId}`);
    }
    if (validatedFields.data.sourceAccountId?.startsWith('goal')) {
        revalidatePath(`/goals/${validatedFields.data.sourceAccountId}`);
    }
    
    return { success: true, message: 'Transação adicionada com sucesso!' };

  } catch(error) {
     console.error('Erro ao criar transação:', error);
     return { success: false, message: 'Ocorreu um erro no servidor ao salvar a transação.' };
  }
}

export async function updateTransaction(prevState: TransactionState, formData: FormData): Promise<TransactionState> {
  const cookieStore = cookies();
  const userId = cookieStore.get('CAIXINHAS_USER_ID')?.value;

  if (!userId) {
    return { success: false, message: 'Usuário não autenticado.' };
  }

  const chargeType = formData.get('chargeType');
  const ownerId = formData.get('ownerId') as string;
  const ownerType = ownerId === userId ? 'user' : 'vault';
  
  const rawData = {
    id: formData.get('id'),
    ownerId,
    ownerType,
    description: formData.get('description'),
    amount: formData.get('amount'),
    type: formData.get('type'),
    category: formData.get('category'),
    date: formData.get('date'),
    sourceAccountId: formData.get('sourceAccountId') || null,
    destinationAccountId: formData.get('destinationAccountId') || null,
    paymentMethod: formData.get('paymentMethod'),
    isRecurring: chargeType === 'recurring',
    isInstallment: chargeType === 'installment',
    installmentNumber: formData.get('installmentNumber'),
    totalInstallments: formData.get('totalInstallments'),
    actorId: userId,
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
    
    await invalidateReportCache(originalTransaction.date.toISOString(), originalTransaction.ownerId);
    if(data.date && originalTransaction.date.toISOString() !== data.date) {
        await invalidateReportCache(data.date, data.ownerId);
    }
    
    revalidatePath('/');
    revalidatePath('/transactions');
    revalidatePath('/reports');
    if (originalTransaction.destinationAccountId?.startsWith('goal')) revalidatePath(`/goals/${originalTransaction.destinationAccountId}`);
    if (originalTransaction.sourceAccountId?.startsWith('goal')) revalidatePath(`/goals/${originalTransaction.sourceAccountId}`);
    if (data.destinationAccountId?.startsWith('goal')) revalidatePath(`/goals/${data.destinationAccountId}`);
    if (data.sourceAccountId?.startsWith('goal')) revalidatePath(`/goals/${data.sourceAccountId}`);
    
    return { success: true, message: 'Transação atualizada com sucesso!' };

  } catch(error) {
     console.error('Erro ao atualizar transação:', error);
     return { success: false, message: 'Ocorreu um erro no servidor ao atualizar a transação.' };
  }
}

export async function deleteTransaction(prevState: { message: string | null }, formData: FormData): Promise<{ message: string | null }> {
  const validatedFields = deleteTransactionSchema.safeParse({
    id: formData.get('id'),
  });

  if (!validatedFields.success) {
    return {
      message: 'ID da transação inválido.',
    };
  }
  
  const { id } = validatedFields.data;
  
  try {
    const deletedTransaction = await TransactionService.getTransactionById(id);
    if (deletedTransaction) {
        await invalidateReportCache(deletedTransaction.date.toISOString(), deletedTransaction.ownerId);
        await TransactionService.deleteTransaction(id);
        
        revalidatePath('/');
        revalidatePath('/transactions');
        revalidatePath('/reports');
        if (deletedTransaction.destinationAccountId?.startsWith('goal')) revalidatePath(`/goals/${deletedTransaction.destinationAccountId}`);
        if (deletedTransaction.sourceAccountId?.startsWith('goal')) revalidatePath(`/goals/${deletedTransaction.sourceAccountId}`);

        return { message: 'Transação excluída com sucesso!' };
    }
    return { message: 'Erro: Transação não encontrada.' };
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    return { message: 'Ocorreu um erro no servidor ao deletar a transação.' };
  }
}
