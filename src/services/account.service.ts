

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
        orderBy: { updatedAt: 'desc' },
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
      
      const vaultAccounts = await prisma.account.findMany({ 
        where: { vaultId: scope } 
      });
      
      const visiblePersonalAccounts = await prisma.account.findMany({
        where: {
          scope: 'personal',
          visibleIn: { has: scope }
        }
      });

      return [...vaultAccounts, ...visiblePersonalAccounts] as Account[];

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
  static async updateBalance(accountId: string, amount: number, type: 'income' | 'expense'): Promise<void> {
    try {
        const operation = type === 'income' ? 'increment' : 'decrement';
        await prisma.account.update({
            where: { id: accountId },
            data: { 
                balance: { [operation]: amount }
            },
        });
    } catch (error) {
        console.error('Erro ao atualizar saldo:', error);
        throw new Error('Não foi possível atualizar o saldo');
    }
  }

  /**
   * Calcula ativos líquidos (contas correntes e poupança)
   */
  static async calculateLiquidAssets(userId: string, scope: string): Promise<number> {
    try {
        const whereClause: any = {
            type: { in: ['checking', 'savings'] }
        };

        if (scope === userId) { // Pessoal
            whereClause.ownerId = userId;
            whereClause.scope = 'personal';
        } else { // Cofre
            whereClause.OR = [
                { vaultId: scope },
                { ownerId: userId, visibleIn: { has: scope } }
            ]
        }

        const result = await prisma.account.aggregate({
            _sum: { balance: true },
            where: whereClause,
        });

        return result._sum.balance || 0;
    } catch (error) {
        console.error('Erro ao calcular ativos líquidos:', error);
        return 0;
    }
  }

  /**
   * Calcula ativos investidos (contas de investimento)
   */
  static async calculateInvestedAssets(userId: string, scope: string): Promise<number> {
    try {
        const whereClause: any = { type: 'investment' };

        if (scope === userId) {
            whereClause.ownerId = userId;
            whereClause.scope = 'personal';
        } else {
             whereClause.OR = [
                { vaultId: scope },
                { ownerId: userId, visibleIn: { has: scope } }
            ]
        }

        const result = await prisma.account.aggregate({
            _sum: { balance: true },
            where: whereClause,
        });

        return result._sum.balance || 0;
    } catch (error) {
        console.error('Erro ao calcular ativos investidos:', error);
        return 0;
    }
  }

  /**
   * Busca os balanços agregados por tipo de conta
   */
  static async getAccountBalances(userId: string, scope: string): Promise<{
    liquid: number;
    invested: number;
    creditCardDebt: number;
  }> {
    try {
      const whereClause: any = {};

      if (scope === userId) { // Personal scope
        whereClause.ownerId = userId;
        whereClause.scope = 'personal';
      } else { // Vault scope
        whereClause.OR = [
          { vaultId: scope },
          { ownerId: userId, visibleIn: { has: scope } }
        ];
      }

      const balancesByType = await prisma.account.groupBy({
        by: ['type'],
        _sum: {
          balance: true,
        },
        where: whereClause,
      });

      let liquid = 0;
      let invested = 0;
      let creditCardDebt = 0;

      for (const group of balancesByType) {
        const balance = group._sum.balance ?? 0;
        switch (group.type) {
          case 'checking':
          case 'savings':
            liquid += balance;
            break;
          case 'investment':
            invested += balance;
            break;
          case 'credit':
            creditCardDebt += balance;
            break;
        }
      }
      
      return { liquid, invested, creditCardDebt };

    } catch (error) {
        console.error('Erro ao buscar balanços das contas:', error);
        return { liquid: 0, invested: 0, creditCardDebt: 0 };
    }
  }
}
