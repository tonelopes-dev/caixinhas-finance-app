
"use server";
import { prisma } from '@/services';
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
    scope: 'personal' | string; // Changed from 'shared'
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
 * Inclui todas as contas (pessoais + vaults) e todas as metas, evitando duplicatas.
 */
export async function getPatrimonyData(userId: string): Promise<PatrimonyData> {
  try {
    const userVaults = await VaultService.getUserVaults(userId);
    const vaultIds = userVaults.map(v => v.id);

    const allAccountsRaw = await prisma.account.findMany({
      where: {
        OR: [
          { ownerId: userId }, // All accounts owned by the user
          { vaultId: { in: vaultIds } }, // All accounts belonging to user's vaults
        ],
      },
    });
    
    // Filtra contas duplicadas, garantindo que cada conta apareça apenas uma vez.
    const uniqueAccountIds = new Set<string>();
    const allAccounts = allAccountsRaw.filter(account => {
        if (uniqueAccountIds.has(account.id)) {
            return false;
        }
        uniqueAccountIds.add(account.id);
        return true;
    });

    // Buscar todas as metas pessoais e de cofres do usuário
    const personalGoals = await GoalService.getUserGoals(userId);
    const vaultGoalsPromises = userVaults.map((vault) =>
      GoalService.getVaultGoals(vault.id)
    );
    const vaultGoalsArrays = await Promise.all(vaultGoalsPromises);
    const allGoals = [...personalGoals, ...vaultGoalsArrays.flat()];

    return {
      accounts: allAccounts.map((account) => ({
        id: account.id,
        name: account.name,
        bank: account.bank,
        type: account.type as 'checking' | 'savings' | 'investment' | 'credit_card',
        balance: account.balance,
        creditLimit: account.creditLimit,
        logoUrl: account.logoUrl,
        scope: account.vaultId || 'personal',
        ownerId: account.ownerId,
      })),
      goals: allGoals.map((goal) => ({
        id: goal.id,
        name: goal.name,
        emoji: goal.emoji,
        currentAmount: goal.currentAmount,
        targetAmount: goal.targetAmount,
        ownerId: goal.userId || goal.vaultId,
        ownerType: goal.userId ? 'user' : 'vault',
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
