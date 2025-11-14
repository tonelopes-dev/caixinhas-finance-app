import { prisma } from './prisma';
import type { Account } from '@/lib/definitions';

/**
 * Serviço para gerenciar contas bancárias
 */
export class AccountService {
  /**
   * Cria uma nova conta
   */
  static async createAccount(data: {
    name: string;
    bank: string;
    type: string;
    balance: number;
    creditLimit?: number;
    logoUrl?: string;
    scope: string;
    ownerId: string;
    vaultId?: string;
    visibleIn?: string[];
  }): Promise<Account> {
    try {
      const account = await prisma.account.create({
        data: {
          name: data.name,
          bank: data.bank,
          type: data.type,
          balance: data.balance,
          creditLimit: data.creditLimit,
          logoUrl: data.logoUrl,
          scope: data.scope,
          ownerId: data.ownerId,
          vaultId: data.vaultId,
          visibleIn: data.visibleIn || [],
        },
      });

      return account as Account;
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      throw new Error('Não foi possível criar a conta');
    }
  }

  /**
   * Busca contas de um usuário
   */
  static async getUserAccounts(userId: string): Promise<Account[]> {
    try {
      const accounts = await prisma.account.findMany({
        where: { ownerId: userId, scope: 'personal' },
        orderBy: { createdAt: 'desc' },
      });

      return accounts as Account[];
    } catch (error) {
      console.error('Erro ao buscar contas do usuário:', error);
      throw new Error('Não foi possível buscar as contas do usuário');
    }
  }

  /**
   * Busca contas visíveis para um usuário em um determinado scope
   * Se scope é o próprio userId, retorna apenas contas pessoais
   * Se scope é um vaultId, retorna contas do vault + contas pessoais visíveis neste vault
   */
  static async getVisibleAccounts(
    userId: string,
    scope: string
  ): Promise<Account[]> {
    try {
      // Se scope é o próprio userId, retorna apenas contas pessoais
      if (scope === userId) {
        const personalAccounts = await prisma.account.findMany({ 
          where: { ownerId: userId, scope: 'personal' } 
        });
        return personalAccounts as Account[];
      }
      
      // Por enquanto, retorna apenas contas do vault diretamente até corrigir o schema
      const accounts = await prisma.account.findMany({
        where: { vaultId: scope },
        orderBy: { createdAt: 'desc' },
      });

      return accounts as Account[];

    } catch (error) {
      console.error('Erro ao buscar contas visíveis:', error);
      throw new Error('Não foi possível buscar as contas visíveis');
    }
  }

  /**
   * Busca uma conta por ID
   */
  static async getAccountById(accountId: string): Promise<Account | null> {
    try {
      const account = await prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account) return null;

      return account as Account;
    } catch (error) {
      console.error('Erro ao buscar conta:', error);
      throw new Error('Não foi possível buscar a conta');
    }
  }

  /**
   * Atualiza uma conta
   */
  static async updateAccount(
    accountId: string,
    data: {
      name?: string;
      bank?: string;
      type?: string;
      balance?: number;
      creditLimit?: number;
      logoUrl?: string;
      visibleIn?: string[];
    }
  ): Promise<Account> {
    try {
      const account = await prisma.account.update({
        where: { id: accountId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.bank && { bank: data.bank }),
          ...(data.type && { type: data.type }),
          ...(data.balance !== undefined && { balance: data.balance }),
          ...(data.creditLimit !== undefined && { creditLimit: data.creditLimit }),
          ...(data.logoUrl && { logoUrl: data.logoUrl }),
          ...(data.visibleIn && { visibleIn: data.visibleIn }),
        },
      });

      return account as Account;
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      throw new Error('Não foi possível atualizar a conta');
    }
  }

  /**
   * Exclui uma conta
   */
  static async deleteAccount(accountId: string): Promise<void> {
    try {
      await prisma.account.delete({
        where: { id: accountId },
      });
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      throw new Error('Não foi possível excluir a conta');
    }
  }

  /**
   * Atualiza o saldo de uma conta
   */
  static async updateBalance(accountId: string, newBalance: number): Promise<void> {
    try {
      await prisma.account.update({
        where: { id: accountId },
        data: { balance: newBalance },
      });
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
      throw new Error('Não foi possível atualizar o saldo');
    }
  }

  /**
   * Busca contas de um vault
   */
  static async getVaultAccounts(vaultId: string): Promise<Account[]> {
    try {
      const accounts = await prisma.account.findMany({
        where: { vaultId },
        orderBy: { createdAt: 'desc' },
      });

      return accounts as Account[];
    } catch (error) {
      console.error('Erro ao buscar contas do vault:', error);
      throw new Error('Não foi possível buscar as contas do vault');
    }
  }

  /**
   * Calcula o patrimônio líquido de um usuário
   */
  static async getUserNetWorth(userId: string): Promise<number> {
    try {
      const result = await prisma.account.aggregate({
        where: { ownerId: userId, scope: 'personal' },
        _sum: { balance: true },
      });

      return result._sum?.balance || 0;
    } catch (error) {
      console.error('Erro ao calcular patrimônio:', error);
      throw new Error('Não foi possível calcular o patrimônio');
    }
  }

  /**
   * Calcula o patrimônio de um vault
   */
  static async getVaultNetWorth(vaultId: string): Promise<number> {
    try {
      const result = await prisma.account.aggregate({
        where: { vaultId },
        _sum: { balance: true },
      });

      return result._sum?.balance || 0;
    } catch (error) {
      console.error('Erro ao calcular patrimônio do vault:', error);
      throw new Error('Não foi possível calcular o patrimônio do vault');
    }
  }
}
