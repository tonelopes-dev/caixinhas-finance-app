
// Este arquivo agora trabalha apenas com dados reais do banco via services
// Os dados mock foram removidos para usar apenas os dados do banco de dados

import type { User, Vault, Account, Goal, Transaction, VaultInvitation, SavedReport } from './definitions';

// --- UTILIDADES ---

// Array de logos de bancos (atualizadas com imagens processadas)
export const bankLogos = [
  '/images/banks/nubank.png',
  '/images/banks/itau.png', 
  '/images/banks/bradesco.png',
  '/images/banks/santander.png',
  '/images/banks/banco-do-brasil.png',
  '/images/banks/caixa.png',
  '/images/banks/inter.png',
  '/images/banks/c6bank.png',
  '/images/banks/btg.png',
  '/images/banks/pag-bank.png',
  '/images/banks/safra-bank.png',
  '/images/banks/logo-sicredi-icon-256.png',
  '/images/banks/generic-bank.png' // Ícone genérico para outros bancos
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
