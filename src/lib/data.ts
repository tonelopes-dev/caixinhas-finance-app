
import type { User, Vault, Account, Goal, Transaction, VaultInvitation, SavedReport } from './definitions';
import { users } from '@/lib/mock-data/users';
import { vaults } from '@/lib/mock-data/vaults';
import { accounts } from '@/lib/mock-data/accounts';
import { goals } from '@/lib/mock-data/goals';
import { transactions } from '@/lib/mock-data/transactions';
import { notifications } from '@/lib/mock-data/notifications';


// --- LÓGICA DE SIMULAÇÃO ---

export const getMockDataForUser = (userId: string | null, workspaceId: string | null) => {
    if (!userId) {
        return {
            currentUser: null,
            userAccounts: [],
            userTransactions: [],
            userGoals: [],
            userVaults: [],
            userInvitations: [],
            currentVault: null,
        };
    }

    const currentUser = users.find(u => u.id === userId) || null;
    if (!currentUser) { // If user not found, return empty state
         return {
            currentUser: null,
            userAccounts: [],
            userTransactions: [],
            userGoals: [],
            userVaults: [],
            userInvitations: [],
            currentVault: null,
        };
    }

    const isPersonalWorkspace = workspaceId === userId;
    const currentVault = isPersonalWorkspace ? null : vaults.find(v => v.id === workspaceId) || null;

    // Vaults the user is a member of.
    const userVaults = vaults.filter(v => v.members.some(m => m.id === userId));

    const accountsForWorkspace = workspaceId ? accounts.filter(account => {
        if (isPersonalWorkspace) {
            // In personal space, show only personal accounts.
            return account.scope === 'personal' && account.ownerId === userId;
        } else {
            // In a vault, show joint accounts for that vault...
            if (account.scope === workspaceId) return true;
            // ...and personal accounts of the current user made visible to this vault.
            if (account.scope === 'personal' && account.ownerId === userId && account.visibleIn?.includes(workspaceId)) return true;
        }
        return false;
    }) : [];

    const goalsForWorkspace = workspaceId ? goals.filter(g => {
        if (isPersonalWorkspace) {
            // In personal space, show only personal goals.
            return g.ownerType === 'user' && g.ownerId === userId;
        } else {
            // In a vault, show goals owned by that vault.
            if (g.ownerType === 'vault' && g.ownerId === workspaceId) {
                // Public goals are always visible. Private goals only to participants.
                return g.visibility === 'shared' || g.participants?.some(p => p.id === userId);
            }
        }
        return false;
    }) : [];

    // Convites pendentes (lógica de exemplo)
    const userInvitations: VaultInvitation[] = [];

    return {
        currentUser,
        userAccounts: accountsForWorkspace,
        userTransactions: workspaceId ? transactions.filter(t => t.ownerId === workspaceId) : [],
        userGoals: goalsForWorkspace,
        userVaults,
        userInvitations,
        currentVault,
    };
};

// --- DADOS MOCKS LEGADOS (A SEREM REMOVIDOS) ---
// Mantidos temporariamente para evitar quebras em componentes que ainda não foram refatorados.
export { users, user, partner } from '@/lib/mock-data/users';
export { vaults, vaultInvitations } from '@/lib/mock-data/vaults';
export { bankLogos, accounts } from '@/lib/mock-data/accounts';
export { goals } from '@/lib/mock-data/goals';
export { transactions } from '@/lib/mock-data/transactions';
export { invitations, notifications } from '@/lib/mock-data/notifications';
export { savedReports } from '@/lib/mock-data/reports';
