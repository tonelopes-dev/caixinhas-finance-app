'use server';

import { transactions } from '@/lib/data';

export async function getRecurringData(userId: string, workspaceId: string) {
  const userTransactions = transactions.filter(t => t.ownerId === workspaceId);

  const recurring = userTransactions.filter(t => t.isRecurring);
  const installments = userTransactions.filter(t => t.isInstallment);

  return { recurring, installments };
}
