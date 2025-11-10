"use server";

import {
  AuthService,
  VaultService,
  AccountService,
  GoalService,
  TransactionService,
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
    const ownerType = isPersonalWorkspace ? 'user' : 'vault';

    // Buscar dados em paralelo
    const [user, accounts, goals, transactions, vault, vaultMembers] =
      await Promise.all([
        AuthService.getUserById(userId),
        AccountService.getVisibleAccounts(userId, workspaceId),
        GoalService.getGoals(workspaceId, ownerType),
        TransactionService.getCurrentMonthTransactions(workspaceId, ownerType),
        !isPersonalWorkspace ? VaultService.getVaultById(workspaceId) : null,
        !isPersonalWorkspace ? VaultService.getVaultById(workspaceId) : null,
      ]);

    if (!user) {
      return null;
    }

    // Determine workspace name and partner
    let workspaceName = 'Minha Conta Pessoal';
    let partner = null;

    if (!isPersonalWorkspace && vault) {
      workspaceName = vault.name;
      // Find partner (other member)
      const otherMember = vault.members?.find(
        (m: any) => m.user.id !== userId
      );
      if (otherMember) {
        partner = {
          id: otherMember.user.id,
          name: otherMember.user.name,
          email: otherMember.user.email,
          avatarUrl: otherMember.user.avatarUrl,
          subscriptionStatus: 'active' as 'active' | 'inactive' | 'trial',
        };
      }
    }

    // Format data
    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || '',
      subscriptionStatus: user.subscriptionStatus as 'active' | 'inactive' | 'trial',
    };

    const formattedAccounts = accounts.map((account) => ({
      id: account.id,
      name: account.name,
      bank: account.bank,
      type: account.type as 'checking' | 'savings' | 'investment' | 'credit_card' | 'other',
      balance: account.balance,
      creditLimit: account.creditLimit || 0,
      logoUrl: account.logoUrl || '',
      ownerId: account.ownerId,
      scope: account.scope,
    }));

    const formattedGoals = goals.map((goal) => ({
      id: goal.id,
      name: goal.name,
      emoji: goal.emoji,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      visibility: goal.visibility as 'private' | 'shared',
      isFeatured: goal.isFeatured,
      ownerId: goal.ownerId,
      ownerType: goal.ownerType as 'user' | 'vault',
      participants: goal.participants?.map((p: any) => ({
        id: p.user.id,
        name: p.user.name,
        avatarUrl: p.user.avatarUrl || '',
        role: p.role,
      })) || [],
    }));

    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      date: transaction.date.toISOString(),
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type as 'income' | 'expense' | 'transfer',
      category: transaction.category,
      paymentMethod: transaction.paymentMethod as 'pix' | 'credit_card' | 'debit_card' | 'transfer' | 'boleto' | 'cash' | undefined,
      sourceAccountId: transaction.sourceAccountId,
      destinationAccountId: transaction.destinationAccountId,
      goalId: transaction.goalId,
      actorId: transaction.actorId,
      isRecurring: transaction.isRecurring,
      ownerId: transaction.ownerId,
      ownerType: transaction.ownerType as 'user' | 'vault',
    }));

    return {
      currentUser: formattedUser,
      partner,
      workspaceId,
      workspaceName,
      isPersonalWorkspace,
      accounts: formattedAccounts,
      goals: formattedGoals,
      transactions: formattedTransactions,
    };
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return null;
  }
}

/**
 * Calcula estatísticas do patrimônio
 */
export async function getNetWorthStats(userId: string, workspaceId: string) {
  try {
    const isPersonalWorkspace = workspaceId === userId;
    const ownerType = isPersonalWorkspace ? 'user' : 'vault';

    const [liquidAssets, investedAssets, goalAssets] = await Promise.all([
      AccountService.calculateLiquidAssets(userId, workspaceId),
      AccountService.calculateInvestedAssets(userId, workspaceId),
      GoalService.calculateTotalSaved(workspaceId, ownerType),
    ]);

    return {
      liquidAssets,
      investedAssets,
      goalAssets,
      totalNetWorth: liquidAssets + investedAssets + goalAssets,
    };
  } catch (error) {
    console.error('Erro ao calcular patrimônio:', error);
    return {
      liquidAssets: 0,
      investedAssets: 0,
      goalAssets: 0,
      totalNetWorth: 0,
    };
  }
}
