'use server';

import { TransactionService } from '@/services';
import type { Transaction } from '@/lib/definitions';

export async function getRecurringData(
  workspaceId: string,
  ownerType: 'user' | 'vault'
): Promise<{ recurring: Transaction[]; installments: Transaction[] }> {
  try {
    const allTransactions = await TransactionService.getTransactions(workspaceId, ownerType);

    const recurring = allTransactions.filter((t: any) => t.isRecurring);
    const installments = allTransactions.filter((t: any) => t.isInstallment);

    return {
      recurring: recurring as Transaction[],
      installments: installments as Transaction[],
    };
  } catch (error) {
    console.error('Erro ao buscar dados recorrentes:', error);
    return { recurring: [], installments: [] };
  }
}
