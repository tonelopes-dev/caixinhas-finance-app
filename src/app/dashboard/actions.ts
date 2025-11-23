
"use server";

import { AccountService } from '@/services/account.service';
import { GoalService } from '@/services/goal.service';
import { TransactionService } from '@/services/transaction.service';

/**
 * Busca todos os dados necessários para o dashboard
 * @param userId - ID do usuário logado
 * @param workspaceId - ID do workspace (userId para pessoal, vaultId para compartilhado)
 * @returns Dados formatados para o dashboard
 */
export async function getDashboardData(userId: string, workspaceId: string) {
  try {
    const isPersonalWorkspace = workspaceId === userId;
    const owner = {
      ownerType: isPersonalWorkspace ? 'user' as const : 'vault' as const,
      ownerId: workspaceId,
    };

    const [accounts, featuredGoals, recentTransactions, balanceSummary] = await Promise.all([
      AccountService.getUserAccounts(userId),
      // Corrigido: Passar argumentos desestruturados
      GoalService.getFeaturedGoals(owner.ownerId, owner.ownerType),
      TransactionService.getRecentTransactions(owner.ownerId, owner.ownerType, 5),
      AccountService.getAccountBalances(owner.ownerId, owner.ownerType),
    ]);

    return {
      accounts,
      featuredGoals,
      recentTransactions,
      balanceSummary,
    };
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return {
      accounts: [],
      featuredGoals: [],
      recentTransactions: [],
      balanceSummary: { totalBalance: 0, accountBalances: [] },
    };
  }
}
