
import { prisma } from './prisma';

/**
 * TransactionAnalysisService
 * 
 * Serviço responsável por cálculos e análises sobre dados de transações.
 */
export class TransactionAnalysisService {

  /**
   * Calcula o total de receitas para um determinado contexto.
   */
  static async calculateTotalIncome(ownerId: string, ownerType: 'user' | 'vault'): Promise<number> {
    try {
      const result = await prisma.transaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          ownerId,
          ownerType,
          type: 'income',
        },
      });
      return result._sum.amount || 0;
    } catch (error) {
      console.error('Erro ao calcular total de receitas:', error);
      throw new Error('Não foi possível calcular o total de receitas');
    }
  }

  /**
   * Calcula o total de despesas para um determinado contexto.
   */
  static async calculateTotalExpenses(ownerId: string, ownerType: 'user' | 'vault'): Promise<number> {
    try {
       const result = await prisma.transaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          ownerId,
          ownerType,
          type: 'expense',
        },
      });
      return result._sum.amount || 0;
    } catch (error) {
      console.error('Erro ao calcular total de despesas:', error);
      throw new Error('Não foi possível calcular o total de despesas');
    }
  }
}
