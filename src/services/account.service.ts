import { prisma } from './prisma';

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
            { ownerId: userId, visibleIn: { has: scope } },
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
    scope: string;
    vaultId?: string;
    creditLimit?: number;
    logoUrl?: string;
    visibleIn?: string[];
    allowFullAccess?: boolean;
  }): Promise<any> {
    try {
      const createData: any = {
        name: data.name,
        bank: data.bank,
        type: data.type,
        balance: data.balance,
        scope: data.scope,
        creditLimit: data.creditLimit,
        logoUrl: data.logoUrl,
        visibleIn: data.visibleIn || [],
        allowFullAccess: data.allowFullAccess ?? false,
        owner: {
          connect: { id: data.ownerId }
        },
      };

      if (data.vaultId) {
        createData.vault = {
          connect: { id: data.vaultId }
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
      allowFullAccess: boolean;
      scope: string;
      vaultId: string | null;
    }>
  ): Promise<any> {
    try {
      // Buscar a conta atual para verificar mudanças de escopo
      const currentAccount = await prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!currentAccount) {
        throw new Error('Conta não encontrada');
      }

      // Separar dados que podem causar problemas de relacionamento
      const { vaultId, ...updateData } = data;
      
      // Preparar dados para update
      const prismaData: any = { ...updateData };

      // Tratar mudanças de escopo adequadamente
      if (data.scope === 'personal' && currentAccount.vaultId) {
        // Mudando de compartilhada para pessoal: desconectar do vault
        prismaData.vault = { disconnect: true };
        prismaData.vaultId = null;
      } else if (data.scope === 'shared' && vaultId && vaultId !== currentAccount.vaultId) {
        // Mudando de pessoal para compartilhada ou mudando de vault: conectar ao novo vault
        prismaData.vault = { connect: { id: vaultId } };
        prismaData.vaultId = vaultId;
      }

      return await prisma.account.update({
        where: { id: accountId },
        data: prismaData,
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
      await prisma.account.delete({
        where: { id: accountId },
      });
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      throw new Error('Não foi possível deletar a conta');
    }
  }

  /**
   * Atualiza o saldo de uma conta
   */
  static async updateBalance(accountId: string, newBalance: number): Promise<any> {
    try {
      return await prisma.account.update({
        where: { id: accountId },
        data: { balance: newBalance },
      });
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
      throw new Error('Não foi possível atualizar o saldo da conta');
    }
  }

  /**
   * Calcula o total de ativos líquidos (checking + savings)
   */
  static async calculateLiquidAssets(userId: string, scope: string): Promise<number> {
    try {
      let accounts;
      
      if (scope === userId) {
        accounts = await prisma.account.findMany({
          where: {
            ownerId: userId,
            type: { in: ['checking', 'savings'] },
          },
        });
      } else {
        accounts = await prisma.account.findMany({
          where: {
            OR: [
              { ownerId: userId, visibleIn: { has: scope } },
              { vaultId: scope },
            ],
            type: { in: ['checking', 'savings'] },
          },
        });
      }

      return accounts.reduce((sum: number, account: any) => sum + account.balance, 0);
    } catch (error) {
      console.error('Erro ao calcular ativos líquidos:', error);
      throw new Error('Não foi possível calcular os ativos líquidos');
    }
  }

  /**
   * Calcula o total de investimentos
   */
  static async calculateInvestedAssets(userId: string, scope: string): Promise<number> {
    try {
      let accounts;
      
      if (scope === userId) {
        accounts = await prisma.account.findMany({
          where: {
            ownerId: userId,
            type: 'investment',
          },
        });
      } else {
        accounts = await prisma.account.findMany({
          where: {
            OR: [
              { ownerId: userId, visibleIn: { has: scope } },
              { vaultId: scope },
            ],
            type: 'investment',
          },
        });
      }

      return accounts.reduce((sum: number, account: any) => sum + account.balance, 0);
    } catch (error) {
      console.error('Erro ao calcular investimentos:', error);
      throw new Error('Não foi possível calcular os investimentos');
    }
  }

  /**
   * Adiciona um vault à lista de visibilidade de uma conta
   */
  static async addVisibility(accountId: string, vaultId: string): Promise<any> {
    try {
      const account = await prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        throw new Error('Conta não encontrada');
      }

      const visibleIn = account.visibleIn.includes(vaultId)
        ? account.visibleIn
        : [...account.visibleIn, vaultId];

      return await prisma.account.update({
        where: { id: accountId },
        data: { visibleIn },
      });
    } catch (error) {
      console.error('Erro ao adicionar visibilidade:', error);
      throw new Error('Não foi possível adicionar visibilidade à conta');
    }
  }

  /**
   * Remove um vault da lista de visibilidade de uma conta
   */
  static async removeVisibility(accountId: string, vaultId: string): Promise<any> {
    try {
      const account = await prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        throw new Error('Conta não encontrada');
      }

      const visibleIn = account.visibleIn.filter((id: string) => id !== vaultId);

      return await prisma.account.update({
        where: { id: accountId },
        data: { visibleIn },
      });
    } catch (error) {
      console.error('Erro ao remover visibilidade:', error);
      throw new Error('Não foi possível remover visibilidade da conta');
    }
  }
}
