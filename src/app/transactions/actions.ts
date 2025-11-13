'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { transactions } from '@/lib/data';
import { invalidateReportCache } from '../reports/actions';

const transactionSchema = z.object({
  id: z.string().optional(),
  ownerId: z.string(),
  description: z.string().min(1, { message: 'A descrição é obrigatória.' }),
  amount: z.coerce.number().positive({ message: 'O valor deve ser positivo.' }),
  type: z.enum(['income', 'expense', 'transfer'], { required_error: 'O tipo é obrigatório.' }),
  category: z.string().min(1, { message: 'A categoria é obrigatória.' }),
  date: z.string().optional(),
  sourceAccountId: z.string().optional(),
  destinationAccountId: z.string().optional(),
  paymentMethod: z.enum(['pix', 'credit_card', 'debit_card', 'transfer', 'boleto', 'cash']).optional(),
  isRecurring: z.boolean().optional(),
  isInstallment: z.boolean().optional(),
  installmentNumber: z.coerce.number().optional(),
  totalInstallments: z.coerce.number().optional(),
}).refine(data => {
    if (data.type === 'income') return !!data.destinationAccountId;
    // For expense, either source or payment method is fine. But source is required if it's not a credit card payment essentially.
    if (data.type === 'expense') return !!data.sourceAccountId || !!data.paymentMethod;
    if (data.type === 'transfer') return !!data.sourceAccountId && !!data.destinationAccountId;
    return false;
}, {
    message: "A conta de origem e/ou destino é necessária dependendo do tipo de transação.",
    path: ['sourceAccountId'],
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
  message?: string | null;
  errors?: {
    id?: string[];
    ownerId?: string[];
    description?: string[];
    amount?: string[];
    type?: string[];
    category?: string[];
    date?: string[];
    sourceAccountId?: string[];
    destinationAccountId?: string[];
    paymentMethod?: string[];
    isRecurring?: string[];
    isInstallment?: string[];
    installmentNumber?: string[];
    totalInstallments?: string[];
  };
}

export async function addTransaction(prevState: TransactionState, formData: FormData): Promise<TransactionState> {
  const chargeType = formData.get('chargeType');
  const validatedFields = transactionSchema.safeParse({
    ownerId: formData.get('ownerId'),
    description: formData.get('description'),
    amount: formData.get('amount'),
    type: formData.get('type'),
    category: formData.get('category'),
    date: formData.get('date'),
    sourceAccountId: formData.get('sourceAccountId'),
    destinationAccountId: formData.get('destinationAccountId'),
    paymentMethod: formData.get('paymentMethod'),
    isRecurring: chargeType === 'recurring',
    isInstallment: chargeType === 'installment',
    installmentNumber: formData.get('installmentNumber'),
    totalInstallments: formData.get('totalInstallments'),
  });

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Falha na validação. Por favor, verifique os campos.',
    };
  }
  
  const { ownerId, ...data } = validatedFields.data;
  const newTransaction = {
    id: (transactions.length + 1).toString(),
    date: data.date || new Date().toISOString(),
    ownerId: ownerId,
    ownerType: ownerId.startsWith('vault-') ? 'vault' : 'user',
    ...data
  };

  transactions.unshift(newTransaction as any);
  console.log('New transaction added:', newTransaction);
  
  invalidateReportCache(newTransaction.date, newTransaction.ownerId);

  revalidatePath('/');
  revalidatePath('/transactions');
  revalidatePath('/reports');
  revalidatePath(`/goals/${newTransaction.destinationAccountId}`);
  revalidatePath(`/goals/${newTransaction.sourceAccountId}`);

  return { message: 'Transação adicionada com sucesso!' };
}

export async function updateTransaction(prevState: TransactionState, formData: FormData): Promise<TransactionState> {
  const chargeType = formData.get('chargeType');
  const validatedFields = transactionSchema.omit({ ownerId: true }).safeParse({
    id: formData.get('id'),
    description: formData.get('description'),
    amount: formData.get('amount'),
    type: formData.get('type'),
    category: formData.get('category'),
    date: formData.get('date'),
    sourceAccountId: formData.get('sourceAccountId'),
    destinationAccountId: formData.get('destinationAccountId'),
    paymentMethod: formData.get('paymentMethod'),
    isRecurring: chargeType === 'recurring',
    isInstallment: chargeType === 'installment',
    installmentNumber: formData.get('installmentNumber'),
    totalInstallments: formData.get('totalInstallments'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Falha na validação. Por favor, verifique os campos.',
    };
  }

  const { id, ...data } = validatedFields.data;
  const index = transactions.findIndex(t => t.id === id);

  if (index > -1) {
    const originalTransaction = transactions[index];
    transactions[index] = {
      ...originalTransaction,
      ...data,
      date: data.date || originalTransaction.date,
    };
    
    invalidateReportCache(originalTransaction.date, originalTransaction.ownerId);
    if(originalTransaction.date !== transactions[index].date) {
        invalidateReportCache(transactions[index].date, transactions[index].ownerId);
    }
    
    console.log(`Transaction with id ${id} updated.`);
    revalidatePath('/');
    revalidatePath('/transactions');
    revalidatePath('/reports');
    revalidatePath(`/goals/${originalTransaction.destinationAccountId}`);
    revalidatePath(`/goals/${originalTransaction.sourceAccountId}`);
    revalidatePath(`/goals/${transactions[index].destinationAccountId}`);
    revalidatePath(`/goals/${transactions[index].sourceAccountId}`);
    return { message: 'Transação atualizada com sucesso!' };
  }
  
  return { message: 'Erro: Transação não encontrada.' };
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
  const index = transactions.findIndex(t => t.id === id);

  if (index > -1) {
    const deletedTransaction = transactions[index];
    invalidateReportCache(deletedTransaction.date, deletedTransaction.ownerId);
    transactions.splice(index, 1);
    console.log(`Transaction with id ${id} deleted.`);
    revalidatePath('/');
    revalidatePath('/transactions');
    revalidatePath('/reports');
    revalidatePath(`/goals/${deletedTransaction.destinationAccountId}`);
    revalidatePath(`/goals/${deletedTransaction.sourceAccountId}`);
    return { message: 'Transação excluída com sucesso!' };
  }

  return { message: 'Erro: Transação não encontrada.' };
}
