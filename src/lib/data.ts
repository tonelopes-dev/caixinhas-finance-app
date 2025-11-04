
import type { User, Vault, Account, Goal, Transaction, VaultInvitation, SavedReport } from './definitions';
import { users } from '@/lib/mock-data/users';
import { vaults } from '@/lib/mock-data/vaults';
import { accounts } from '@/lib/mock-data/accounts';
import { goals } from '@/lib/mock-data/goals';
import { transactions } from '@/lib/mock-data/transactions';
import { notifications } from '@/lib/mock-data/notifications';


// --- LÓGICA DE SIMULAÇÃO ---

export const getMockDataForUser = (userId: string | null, workspaceId: string | null, fetchAll: boolean = false) => {
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
    
    let accountsForUser: Account[] = [];
    if (fetchAll) {
        // Fetch all accounts the user has access to, across all vaults and personal.
        accountsForUser = accounts.filter(account => {
            // Is it their personal account?
            if (account.ownerId === userId && account.scope === 'personal') return true;
            // Is it a joint account in a vault they are part of?
            const isMemberOfVault = userVaults.some(uv => uv.id === account.scope);
            if (isMemberOfVault) return true;
            return false;
        });
    } else if (workspaceId) {
        // Fetch accounts for a specific workspace.
        accountsForUser = accounts.filter(account => {
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
        });
    }


    let goalsForUser: Goal[] = [];
    if (fetchAll) {
        // Get all goals where the user is a participant or owner.
        goalsForUser = goals.filter(g => {
            // Personal goals
            if (g.ownerType === 'user' && g.ownerId === userId) return true;
            // Vault goals where user is a member and can see it
            const vault = userVaults.find(uv => uv.id === g.ownerId);
            if (g.ownerType === 'vault' && vault) {
                return g.visibility === 'shared' || g.participants?.some(p => p.id === userId);
            }
            return false;
        });
    } else if (workspaceId) {
        goalsForUser = goals.filter(g => {
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
        });
    }


    // Convites pendentes (lógica de exemplo)
    const userInvitations: VaultInvitation[] = [];

    return {
        currentUser,
        userAccounts: accountsForUser,
        userTransactions: workspaceId ? transactions.filter(t => t.ownerId === workspaceId) : [],
        userGoals: goalsForUser,
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
