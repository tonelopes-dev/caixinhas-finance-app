
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

    const recurringExpensesRaw = allTransactions.filter((t: any) => t.isRecurring && t.type === 'expense');
    const recurringIncomesRaw = allTransactions.filter((t: any) => t.isRecurring && t.type === 'income');
    
    // Função para agrupar por recurringId e manter apenas a transação mais recente
    const groupByRecurring = (transactions: any[]) => {
      const groups = new Map<string, any>();
      transactions.forEach(t => {
        const id = t.recurringId || t.id;
        const current = groups.get(id);
        if (!current || new Date(t.date) > new Date(current.date)) {
          groups.set(id, t);
        }
      });
      return Array.from(groups.values());
    };

    const recurringExpenses = groupByRecurring(recurringExpensesRaw);
    const recurringIncomes = groupByRecurring(recurringIncomesRaw);
    
    // Filtra transações parceladas - pega apenas a "Master" (parcela 1 ou null)
    const installmentExpenses = allTransactions.filter((t: any) => 
      t.isInstallment && t.type === 'expense' && (t.installmentNumber === 1 || !t.installmentNumber)
    );
    const installmentIncomes = allTransactions.filter((t: any) => 
      t.isInstallment && t.type === 'income' && (t.installmentNumber === 1 || !t.installmentNumber)
    );

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
