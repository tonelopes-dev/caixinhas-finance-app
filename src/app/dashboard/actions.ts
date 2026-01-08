
"use server";

import { cache } from 'react';
import { AccountService } from '@/services/account.service';
import { GoalService } from '@/services/goal.service';
import { TransactionService } from '@/services/transaction.service';

/**
 * ⚡ PERFORMANCE: Cached version para deduplicate requests
 * Busca todos os dados necessários para o dashboard
 * @param userId - ID do usuário logado
 * @param workspaceId - ID do workspace (userId para pessoal, vaultId para compartilhado)
 * @returns Dados formatados para o dashboard
 */
export const getDashboardData = cache(async (userId: string, workspaceId: string) => {
  const startTime = performance.now();
  
  try {
    const isPersonalWorkspace = workspaceId === userId;
    const owner = {
      ownerType: isPersonalWorkspace ? 'user' as const : 'vault' as const,
      ownerId: workspaceId,
    };

    // ⚡ PERFORMANCE: Parallel fetching otimizado
    const [accounts, featuredGoals, recentTransactions, balanceSummary] = await Promise.all([
      AccountService.getUserAccounts(userId),
      GoalService.getFeaturedGoals(owner.ownerId, owner.ownerType),
      TransactionService.getRecentTransactions(owner.ownerId, owner.ownerType, 5),
      AccountService.getAccountBalances(owner.ownerId, owner.ownerType),
    ]);

    const endTime = performance.now();
    console.log(`⚡ Dashboard data loaded in ${(endTime - startTime).toFixed(2)}ms`);

    return {
      accounts,
      featuredGoals,
      recentTransactions,
      balanceSummary,
    };
  } catch (error) {
    console.error('❌ Erro ao buscar dados do dashboard:', error);
    return {
      accounts: [],
      featuredGoals: [],
      recentTransactions: [],
      balanceSummary: { totalBalance: 0, accountBalances: [] },
    };
  }
});
