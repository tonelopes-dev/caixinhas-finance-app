

import { prisma } from './prisma';

/**
 * TransactionService
 * 
 * Serviço responsável pelas operações de escrita (CRUD) de transações financeiras.
 * Para consultas complexas, use TransactionQueryService.
 * Para análises e cálculos, use TransactionAnalysisService.
 */
export class TransactionService {
  /**
   * Busca transações de um contexto (usuário ou vault)
   * Este é o método principal para leitura de listas de transações.
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
   * Busca transações do mês atual para um determinado contexto.
   * Usado principalmente no Dashboard para uma visão rápida.
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
   * Busca uma transação única por seu ID.
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
   * Cria uma nova transação no banco de dados.
   */
  static async createTransaction(data: {
    ownerId: string;
    ownerType: 'user' | 'vault';
    date: Date;
    description: string;
    amount: number;
    type: 'income' | 'expense' | 'transfer';
    category: string;
    actorId: string;
    paymentMethod?: string | null;
    sourceAccountId?: string | null;
    destinationAccountId?: string | null;
    isRecurring?: boolean;
    isInstallment?: boolean;
    installmentNumber?: number;
    totalInstallments?: number;
  }): Promise<any> {
    try {
      const createData: any = {
        ownerType: data.ownerType,
        date: data.date,
        description: data.description,
        amount: data.amount,
        type: data.type,
        category: data.category,
        paymentMethod: data.paymentMethod,
        isRecurring: data.isRecurring ?? false,
        isInstallment: data.isInstallment ?? false,
        installmentNumber: data.installmentNumber,
        totalInstallments: data.totalInstallments,
        actor: { connect: { id: data.actorId } },
      };

      if (data.ownerType === 'vault') {
        createData.vault = { connect: { id: data.ownerId } };
      } else {
        createData.user = { connect: { id: data.ownerId } };
      }
      
      const sourceIsGoal = data.sourceAccountId?.startsWith('goal-');
      const destIsGoal = data.destinationAccountId?.startsWith('goal-');

      if (data.sourceAccountId && !sourceIsGoal) {
        createData.sourceAccount = { connect: { id: data.sourceAccountId } };
      }
      
      if (data.destinationAccountId && !destIsGoal) {
        createData.destinationAccount = { connect: { id: data.destinationAccountId } };
      }

      const goalId = sourceIsGoal ? data.sourceAccountId : destIsGoal ? data.destinationAccountId : undefined;
      if (goalId) {
          createData.goal = { connect: { id: goalId } };
      }
      
      return await prisma.transaction.create({ data: createData });

    } catch (error) {
      console.error('Erro ao criar transação:', error);
      throw new Error('Não foi possível criar a transação');
    }
  }

  /**
   * Atualiza uma transação existente.
   */
  static async updateTransaction(
    transactionId: string,
    data: Partial<{
      date: Date;
      description: string;
      amount: number;
      type: string;
      category: string;
      paymentMethod: string | null;
      sourceAccountId: string | null;
      destinationAccountId: string | null;
      isRecurring: boolean;
      isInstallment: boolean;
      installmentNumber: number;
      totalInstallments: number;
    }>
  ): Promise<any> {
    try {
      const updateData: any = { ...data };
      
      const sourceIsGoal = data.sourceAccountId?.startsWith('goal-');
      const destIsGoal = data.destinationAccountId?.startsWith('goal-');

      if ('sourceAccountId' in data) {
        updateData.sourceAccount = data.sourceAccountId && !sourceIsGoal ? { connect: { id: data.sourceAccountId } } : { disconnect: true };
      }
      if ('destinationAccountId' in data) {
        updateData.destinationAccount = data.destinationAccountId && !destIsGoal ? { connect: { id: data.destinationAccountId } } : { disconnect: true };
      }
      
      const goalId = sourceIsGoal ? data.sourceAccountId : destIsGoal ? data.destinationAccountId : undefined;
      if (goalId !== undefined) {
          updateData.goal = goalId ? { connect: { id: goalId } } : { disconnect: true };
      }

      // Remover os campos de ID simples, pois estamos usando o objeto de conexão
      delete updateData.sourceAccountId;
      delete updateData.destinationAccountId;
      
      return await prisma.transaction.update({
        where: { id: transactionId },
        data: updateData,
      });
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      throw new Error('Não foi possível atualizar a transação');
    }
  }

  /**
   * Deleta uma transação do banco de dados.
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
}
