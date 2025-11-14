
// Este arquivo agora trabalha apenas com dados reais do banco via services
// Os dados mock foram removidos para usar apenas os dados do banco de dados

import type { User, Vault, Account, Goal, Transaction, VaultInvitation, SavedReport } from './definitions';

// --- UTILIDADES ---

// Array de logos de bancos (mantido pois pode ser usado em formulários)
export const bankLogos = [
  'https://logo.clearbit.com/nubank.com.br',
  'https://logo.clearbit.com/itau.com.br', 
  'https://logo.clearbit.com/bradesco.com.br',
  'https://logo.clearbit.com/santander.com.br',
  'https://logo.clearbit.com/bb.com.br',
  'https://logo.clearbit.com/caixa.gov.br',
  'https://logo.clearbit.com/inter.co',
  'https://logo.clearbit.com/c6bank.com.br'
];

// Função helper para trabalhar com dados do banco (se necessário no futuro)
export const getMockDataForUser = async (userId: string | null, workspaceId: string | null, fetchAll: boolean = false) => {
    // Esta função agora deve usar os services em vez de dados mock
    // Por enquanto retorna uma estrutura vazia para evitar quebras
    return {
        currentUser: null,
        userAccounts: [],
        userTransactions: [],
        userGoals: [],
        userVaults: [],
        userInvitations: [],
        currentVault: null,
    };
};

// Exports vazios para evitar quebras temporárias - devem ser removidos gradualmente
export const users: User[] = [];
export const user: User | null = null;
export const partner: User | null = null;
export const vaults: Vault[] = [];
export const vaultInvitations: VaultInvitation[] = [];
export const accounts: Account[] = [];
export const goals: Goal[] = [];
export const transactions: Transaction[] = [];
export const invitations: any[] = [];
export const notifications: any[] = [];

// DEPRECATED: savedReports agora são persistidos no banco de dados via ReportService
// export const savedReports: SavedReport[] = [];
