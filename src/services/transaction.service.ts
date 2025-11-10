import { prisma } from './prisma';

/**
 * TransactionService
 * 
 * Serviço responsável por gerenciar transações financeiras.
 */
export class TransactionService {
  /**
   * Busca todas as transações de um usuário
   */
  static async getUserTransactions(userId: string): Promise<any[]> {
    try {
      return await prisma.transaction.findMany({
        where: {
          ownerId: userId,
          ownerType: 'user',
        },
        include: {
          sourceAccount: true,
          destinationAccount: true,
          goal: true,
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      });
    } catch (error) {
      console.error('Erro ao buscar transações do usuário:', error);
      throw new Error('Não foi possível buscar as transações do usuário');
    }
  }

  /**
   * Busca todas as transações de um cofre
   */
  static async getVaultTransactions(vaultId: string): Promise<any[]> {
    try {
      return await prisma.transaction.findMany({
        where: {
          ownerId: vaultId,
          ownerType: 'vault',
        },
        include: {
          sourceAccount: true,
          destinationAccount: true,
          goal: true,
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      });
    } catch (error) {
      console.error('Erro ao buscar transações do cofre:', error);
      throw new Error('Não foi possível buscar as transações do cofre');
    }
  }

  /**
   * Busca transações de um contexto (usuário ou vault)
   */
  static async getTransactions(ownerId: string, ownerType: 'user' | 'vault'): Promise<any[]> {
    try {
      return await prisma.transaction.findMany({
        where: {
          ownerId,
          ownerType,
        },
        include: {
          sourceAccount: true,
          destinationAccount: true,
          goal: true,
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      });
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      throw new Error('Não foi possível buscar as transações');
    }
  }

  /**
   * Busca transações do mês atual
   */
  static async getCurrentMonthTransactions(ownerId: string, ownerType: 'user' | 'vault'): Promise<any[]> {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      return await prisma.transaction.findMany({
        where: {
          ownerId,
          ownerType,
          date: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
        include: {
          sourceAccount: true,
          destinationAccount: true,
          goal: true,
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      });
    } catch (error) {
      console.error('Erro ao buscar transações do mês:', error);
      throw new Error('Não foi possível buscar as transações do mês');
    }
  }

  /**
   * Busca uma transação por ID
   */
  static async getTransactionById(transactionId: string): Promise<any | null> {
    try {
      return await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          sourceAccount: true,
          destinationAccount: true,
          goal: true,
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Erro ao buscar transação:', error);
      throw new Error('Não foi possível buscar a transação');
    }
  }

  /**
   * Cria uma nova transação
   */
  static async createTransaction(data: {
    ownerId: string;
    ownerType: 'user' | 'vault';
    date: Date;
    description: string;
    amount: number;
    type: 'income' | 'expense' | 'transfer';
    category: string;
    paymentMethod?: string;
    sourceAccountId?: string;
    destinationAccountId?: string;
    actorId?: string;
    goalId?: string;
    isRecurring?: boolean;
  }): Promise<any> {
    try {
      return await prisma.transaction.create({
        data: {
          ownerId: data.ownerId,
          ownerType: data.ownerType,
          date: data.date,
          description: data.description,
          amount: data.amount,
          type: data.type,
          category: data.category,
          paymentMethod: data.paymentMethod,
          sourceAccountId: data.sourceAccountId,
          destinationAccountId: data.destinationAccountId,
          actorId: data.actorId,
          goalId: data.goalId,
          isRecurring: data.isRecurring ?? false,
          vaultId: data.ownerType === 'vault' ? data.ownerId : undefined,
        },
      });
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      throw new Error('Não foi possível criar a transação');
    }
  }

  /**
   * Atualiza uma transação existente
   */
  static async updateTransaction(
    transactionId: string,
    data: Partial<{
      date: Date;
      description: string;
      amount: number;
      type: string;
      category: string;
      paymentMethod: string;
      sourceAccountId: string;
      destinationAccountId: string;
      goalId: string;
      isRecurring: boolean;
    }>
  ): Promise<any> {
    try {
      return await prisma.transaction.update({
        where: { id: transactionId },
        data,
      });
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      throw new Error('Não foi possível atualizar a transação');
    }
  }

  /**
   * Deleta uma transação
   */
  static async deleteTransaction(transactionId: string): Promise<void> {
    try {
      await prisma.transaction.delete({
        where: { id: transactionId },
      });
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      throw new Error('Não foi possível deletar a transação');
    }
  }

  /**
   * Filtra transações por tipo
   */
  static async getTransactionsByType(
    ownerId: string,
    ownerType: 'user' | 'vault',
    type: 'income' | 'expense' | 'transfer'
  ): Promise<any[]> {
    try {
      return await prisma.transaction.findMany({
        where: {
          ownerId,
          ownerType,
          type,
        },
        include: {
          sourceAccount: true,
          destinationAccount: true,
          goal: true,
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      });
    } catch (error) {
      console.error('Erro ao buscar transações por tipo:', error);
      throw new Error('Não foi possível buscar as transações por tipo');
    }
  }

  /**
   * Filtra transações por categoria
   */
  static async getTransactionsByCategory(
    ownerId: string,
    ownerType: 'user' | 'vault',
    category: string
  ): Promise<any[]> {
    try {
      return await prisma.transaction.findMany({
        where: {
          ownerId,
          ownerType,
          category,
        },
        include: {
          sourceAccount: true,
          destinationAccount: true,
          goal: true,
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      });
    } catch (error) {
      console.error('Erro ao buscar transações por categoria:', error);
      throw new Error('Não foi possível buscar as transações por categoria');
    }
  }

  /**
   * Calcula o total de receitas
   */
  static async calculateTotalIncome(ownerId: string, ownerType: 'user' | 'vault'): Promise<number> {
    try {
      const transactions = await prisma.transaction.findMany({
        where: {
          ownerId,
          ownerType,
          type: 'income',
        },
      });

      return transactions.reduce((sum: number, transaction: any) => sum + transaction.amount, 0);
    } catch (error) {
      console.error('Erro ao calcular total de receitas:', error);
      throw new Error('Não foi possível calcular o total de receitas');
    }
  }

  /**
   * Calcula o total de despesas
   */
  static async calculateTotalExpenses(ownerId: string, ownerType: 'user' | 'vault'): Promise<number> {
    try {
      const transactions = await prisma.transaction.findMany({
        where: {
          ownerId,
          ownerType,
          type: 'expense',
        },
      });

      return transactions.reduce((sum: number, transaction: any) => sum + transaction.amount, 0);
    } catch (error) {
      console.error('Erro ao calcular total de despesas:', error);
      throw new Error('Não foi possível calcular o total de despesas');
    }
  }

  /**
   * Busca transações por período
   */
  static async getTransactionsByPeriod(
    ownerId: string,
    ownerType: 'user' | 'vault',
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    try {
      return await prisma.transaction.findMany({
        where: {
          ownerId,
          ownerType,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          sourceAccount: true,
          destinationAccount: true,
          goal: true,
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      });
    } catch (error) {
      console.error('Erro ao buscar transações por período:', error);
      throw new Error('Não foi possível buscar as transações por período');
    }
  }
}
