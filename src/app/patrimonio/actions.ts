"use server";

import { AccountService, GoalService, VaultService } from '@/services';

export type PatrimonyData = {
  accounts: {
    id: string;
    name: string;
    bank: string;
    type: 'checking' | 'savings' | 'investment' | 'credit_card';
    balance: number;
    creditLimit: number | null;
    logoUrl: string | null;
    scope: 'personal' | 'shared';
    ownerId: string;
  }[];
  goals: {
    id: string;
    name: string;
    emoji: string;
    currentAmount: number;
    targetAmount: number;
    ownerId: string;
    ownerType: 'user' | 'vault';
  }[];
  vaults: {
    id: string;
    name: string;
    imageUrl: string | null;
  }[];
};

/**
 * Busca todos os dados de patrimônio do usuário
 * Inclui todas as contas (pessoais + vaults) e todas as metas
 */
export async function getPatrimonyData(userId: string): Promise<PatrimonyData> {
  try {
    // Buscar vaults do usuário
    const userVaults = await VaultService.getUserVaults(userId);

    // Buscar contas pessoais
    const personalAccounts = await AccountService.getUserAccounts(userId);

    // Buscar contas de todos os vaults
    const vaultAccountsPromises = userVaults.map((vault) =>
      AccountService.getVaultAccounts(vault.id)
    );
    const vaultAccountsArrays = await Promise.all(vaultAccountsPromises);
    const vaultAccounts = vaultAccountsArrays.flat();

    // Combinar todas as contas
    const allAccounts = [...personalAccounts, ...vaultAccounts];

    // Buscar metas pessoais
    const personalGoals = await GoalService.getUserGoals(userId);

    // Buscar metas de todos os vaults
    const vaultGoalsPromises = userVaults.map((vault) =>
      GoalService.getVaultGoals(vault.id)
    );
    const vaultGoalsArrays = await Promise.all(vaultGoalsPromises);
    const vaultGoals = vaultGoalsArrays.flat();

    // Combinar todas as metas
    const allGoals = [...personalGoals, ...vaultGoals];

    return {
      accounts: allAccounts.map((account) => ({
        id: account.id,
        name: account.name,
        bank: account.bank,
        type: account.type as 'checking' | 'savings' | 'investment' | 'credit_card',
        balance: account.balance,
        creditLimit: account.creditLimit,
        logoUrl: account.logoUrl,
        scope: account.scope as 'personal' | 'shared',
        ownerId: account.ownerId,
      })),
      goals: allGoals.map((goal) => ({
        id: goal.id,
        name: goal.name,
        emoji: goal.emoji,
        currentAmount: goal.currentAmount,
        targetAmount: goal.targetAmount,
        ownerId: goal.ownerId,
        ownerType: goal.ownerType as 'user' | 'vault',
      })),
      vaults: userVaults.map((vault) => ({
        id: vault.id,
        name: vault.name,
        imageUrl: vault.imageUrl,
      })),
    };
  } catch (error) {
    console.error('Erro ao buscar dados de patrimônio:', error);
    return {
      accounts: [],
      goals: [],
      vaults: [],
    };
  }
}
