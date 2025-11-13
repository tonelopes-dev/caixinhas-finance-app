
import { prisma } from './prisma';
import type { Prisma } from '@prisma/client';

/**
 * AccountService
 * 
 * Serviço responsável por gerenciar contas bancárias e cartões de crédito.
 */
export class AccountService {
  /**
   * Busca todas as contas de um usuário
   */
  static async getUserAccounts(userId: string): Promise<any[]> {
    try {
      return await prisma.account.findMany({
        where: {
          ownerId: userId,
        },
        include: {
          visibleIn: {
            include: {
              vault: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error('Erro ao buscar contas do usuário:', error);
      throw new Error('Não foi possível buscar as contas do usuário');
    }
  }

  /**
   * Busca todas as contas de um cofre
   */
  static async getVaultAccounts(vaultId: string): Promise<any[]> {
    try {
      return await prisma.account.findMany({
        where: {
          vaultId: vaultId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error('Erro ao buscar contas do cofre:', error);
      throw new Error('Não foi possível buscar as contas do cofre');
    }
  }

  /**
   * Busca contas visíveis em um determinado escopo (usuário ou vault)
   */
  static async getVisibleAccounts(userId: string, scope: string): Promise<any[]> {
    try {
      // Se scope é o próprio userId, busca contas pessoais
      if (scope === userId) {
        return await prisma.account.findMany({
          where: {
            ownerId: userId,
            scope: 'personal'
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
      }
      
      // Se scope é um vaultId, busca contas do vault + contas pessoais visíveis
      return await prisma.account.findMany({
        where: {
          OR: [
            // Contas onde o dono é o usuário E a conta está marcada como visível neste cofre
            { ownerId: userId, visibleIn: { some: { vaultId: scope } } },
            // Contas que pertencem diretamente ao cofre
            { vaultId: scope },
          ],
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error('Erro ao buscar contas visíveis:', error);
      throw new Error('Não foi possível buscar as contas visíveis');
    }
  }

  /**
   * Busca uma conta por ID
   */
  static async getAccountById(accountId: string): Promise<any | null> {
    try {
      return await prisma.account.findUnique({
        where: { id: accountId },
        include: {
          visibleIn: {
            include: {
              vault: true,
            }
          }
        }
      });
    } catch (error) {
      console.error('Erro ao buscar conta:', error);
      throw new Error('Não foi possível buscar a conta');
    }
  }

  /**
   * Cria uma nova conta
   */
  static async createAccount(data: {
    name: string;
    bank: string;
    type: string;
    balance: number;
    ownerId: string;
    scope: string; // 'personal' ou 'vault'
    vaultId?: string;
    creditLimit?: number;
    logoUrl?: string;
    visibleIn?: string[];
  }): Promise<any> {
    try {
      const createData: Prisma.AccountCreateInput = {
        name: data.name,
        bank: data.bank,
        type: data.type,
        balance: data.balance,
        scope: data.scope,
        creditLimit: data.creditLimit,
        logoUrl: data.logoUrl,
        owner: {
          connect: { id: data.ownerId }
        },
      };

      if (data.scope === 'vault' && data.vaultId) {
        createData.vault = {
          connect: { id: data.vaultId }
        };
      }
      
      if (data.scope === 'personal' && data.visibleIn && data.visibleIn.length > 0) {
        createData.visibleIn = {
          create: data.visibleIn.map(vaultId => ({
            vault: { connect: { id: vaultId } }
          }))
        };
      }

      return await prisma.account.create({
        data: createData,
      });
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      throw new Error('Não foi possível criar a conta');
    }
  }

  /**
   * Atualiza uma conta existente
   */
  static async updateAccount(
    accountId: string,
    data: Partial<{
      name: string;
      bank: string;
      balance: number;
      creditLimit: number;
      logoUrl: string;
      visibleIn: string[];
    }>
  ): Promise<any> {
    try {
      const { visibleIn, ...updateData } = data;
      const prismaData: Prisma.AccountUpdateInput = { ...updateData };

      // Transação para atualizar a conta e suas visibilidades
      return await prisma.$transaction(async (tx) => {
        // 1. Atualiza os dados básicos da conta
        const updatedAccount = await tx.account.update({
          where: { id: accountId },
          data: prismaData,
        });

        // 2. Sincroniza as visibilidades (se `visibleIn` for fornecido)
        if (visibleIn !== undefined) {
          // Remove todas as visibilidades existentes para esta conta
          await tx.accountVisibility.deleteMany({
            where: { accountId: accountId },
          });

          // Adiciona as novas visibilidades
          if (visibleIn.length > 0) {
            await tx.accountVisibility.createMany({
              data: visibleIn.map((vaultId) => ({
                accountId: accountId,
                vaultId: vaultId,
              })),
            });
          }
        }
        
        return updatedAccount;
      });

    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      throw new Error('Não foi possível atualizar a conta');
    }
  }

  /**
   * Deleta uma conta
   */
  static async deleteAccount(accountId: string): Promise<void> {
    try {
       // Em uma transação para garantir que a conta e suas visibilidades sejam removidas
      await prisma.$transaction(async (tx) => {
        await tx.accountVisibility.deleteMany({
          where: { accountId: accountId },
        });
        await tx.account.delete({
          where: { id: accountId },
        });
      });
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      throw new Error('Não foi possível deletar a conta');
    }
  }
  
  /**
   * Calcula o total de ativos líquidos (contas corrente e poupança) para um determinado contexto.
   */
  static async calculateLiquidAssets(userId: string, scope: string): Promise<number> {
    try {
      const whereClause = scope === userId
        ? { ownerId: userId, scope: 'personal', type: { in: ['checking', 'savings'] } }
        : { OR: [{ vaultId: scope, type: { in: ['checking', 'savings'] } }, { ownerId: userId, visibleIn: { some: { vaultId: scope } }, type: { in: ['checking', 'savings'] }}] };
      
      const result = await prisma.account.aggregate({
        _sum: {
          balance: true,
        },
        where: whereClause,
      });

      return result._sum.balance || 0;
    } catch (error) {
      console.error('Erro ao calcular ativos líquidos:', error);
      throw new Error('Não foi possível calcular os ativos líquidos');
    }
  }

  /**
   * Calcula o total de ativos investidos (contas de investimento) para um determinado contexto.
   */
  static async calculateInvestedAssets(userId: string, scope: string): Promise<number> {
    try {
      const whereClause = scope === userId
        ? { ownerId: userId, scope: 'personal', type: 'investment' }
        : { OR: [{ vaultId: scope, type: 'investment' }, { ownerId: userId, visibleIn: { some: { vaultId: scope } }, type: 'investment' }] };

      const result = await prisma.account.aggregate({
        _sum: {
          balance: true,
        },
        where: whereClause,
      });

      return result._sum.balance || 0;
    } catch (error) {
      console.error('Erro ao calcular ativos investidos:', error);
      throw new Error('Não foi possível calcular os ativos investidos');
    }
  }
}
