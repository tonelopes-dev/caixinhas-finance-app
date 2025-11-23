
'use server';

import { TransactionService } from '@/services/transaction.service';
import type { Transaction } from '@/lib/definitions';
import { revalidatePath } from 'next/cache';

export async function getRecurringData(
  workspaceId: string,
  ownerType: 'user' | 'vault'
): Promise<{ 
    recurringExpenses: Transaction[];
    recurringIncomes: Transaction[];
    installmentExpenses: Transaction[];
    installmentIncomes: Transaction[];
}> {
  try {
    const allTransactions = await TransactionService.getTransactions(workspaceId, ownerType);

    const recurringExpenses = allTransactions.filter((t: any) => t.isRecurring && t.type === 'expense');
    const recurringIncomes = allTransactions.filter((t: any) => t.isRecurring && t.type === 'income');
    
    const installmentExpenses = allTransactions.filter((t: any) => t.isInstallment && t.type === 'expense');
    const installmentIncomes = allTransactions.filter((t: any) => t.isInstallment && t.type === 'income');


    return {
      recurringExpenses: recurringExpenses as Transaction[],
      recurringIncomes: recurringIncomes as Transaction[],
      installmentExpenses: installmentExpenses as Transaction[],
      installmentIncomes: installmentIncomes as Transaction[],
    };
  } catch (error) {
    console.error('Erro ao buscar dados recorrentes:', error);
    return { recurringExpenses: [], recurringIncomes: [], installmentExpenses: [], installmentIncomes: [] };
  }
}

export async function updatePaidInstallmentsAction(
  transactionId: string,
  paidInstallments: number[]
): Promise<{ success: boolean; message?: string }> {
  try {
    await TransactionService.updatePaidInstallments(transactionId, paidInstallments);
    revalidatePath('/recurring');
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar parcelas pagas:', error);
    return { success: false, message: 'Não foi possível atualizar o status das parcelas.' };
  }
}
