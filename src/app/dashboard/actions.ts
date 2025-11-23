
"use server";

import {
  AuthService,
  VaultService,
  AccountService,
  GoalService,
  TransactionService,
  CategoryService,
} from '@/services';

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
      AccountService.getUserAccounts(userId), // Buscar as contas do usuário
      GoalService.getFeaturedGoals(owner),
      TransactionService.getRecentTransactions(owner, 5),
      AccountService.getAccountBalances(owner),
    ]);

    return {
      accounts, // Retornar as contas
      featuredGoals,
      recentTransactions,
      balanceSummary,
    };
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    // Retornar um estado de erro ou valores padrão para evitar que a página quebre
    return {
      accounts: [],
      featuredGoals: [],
      recentTransactions: [],
      balanceSummary: { totalBalance: 0, accountBalances: [] },
    };
  }
}
