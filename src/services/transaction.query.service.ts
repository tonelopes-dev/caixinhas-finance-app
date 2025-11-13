
import { prisma } from './prisma';

/**
 * TransactionQueryService
 * 
 * Serviço responsável por consultas complexas e filtragem de transações.
 */
export class TransactionQueryService {

  /**
   * Filtra transações por tipo (income, expense, transfer).
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
   * Filtra transações por uma categoria específica.
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
   * Busca transações dentro de um período de datas específico.
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
