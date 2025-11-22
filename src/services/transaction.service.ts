
import { prisma } from './prisma';
import { AccountService } from './account.service';
import { GoalService } from './goal.service';


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
      const whereClause: any = ownerType === 'user' ? { userId: ownerId } : { vaultId: ownerId };
      return await prisma.transaction.findMany({
        where: whereClause,
        include: {
          category: true,
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
   * Busca transações para uma meta específica.
   */
  static async getTransactionsForGoal(goalId: string): Promise<any[]> {
    try {
      return await prisma.transaction.findMany({
        where: {
          goalId: goalId,
        },
        include: {
          category: true,
          actor: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      });
    } catch (error) {
      console.error('Erro ao buscar transações da meta:', error);
      throw new Error('Não foi possível buscar as transações da meta');
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

      const whereClause: any = ownerType === 'user' ? { userId: ownerId } : { vaultId: ownerId };
      whereClause.date = {
        gte: firstDayOfMonth,
        lte: lastDayOfMonth,
      };

      return await prisma.transaction.findMany({
        where: whereClause,
        include: {
          category: true,
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
      const result = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          category: true,
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
      return result;
    } catch (error) {
      console.error('Erro ao buscar transação:', error);
      throw new Error('Não foi possível buscar a transação');
    }
  }

  /**
   * Cria uma nova transação no banco de dados.
   */
  static async createTransaction(data: {
    userId?: string;
    vaultId?: string;
    date: Date;
    description: string;
    amount: number;
    type: 'income' | 'expense' | 'transfer';
    category: string;
    actorId: string;
    paymentMethod?: string | null;
    sourceAccountId?: string | null;
    destinationAccountId?: string | null;
    goalId?: string | null;
    isRecurring?: boolean;
    isInstallment?: boolean;
    installmentNumber?: number;
    totalInstallments?: number;
    paidInstallments?: number[];
    projectRecurring?: boolean;
  }): Promise<any> {
    return prisma.$transaction(async (tx) => {
      try {
        const recurringId = data.isRecurring ? require('crypto').randomUUID() : null;

        const createSingleTransaction = async (transactionData: typeof data, customDate?: Date) => {
            const createData: any = {
                date: customDate || transactionData.date,
                description: transactionData.description,
                amount: transactionData.amount,
                type: transactionData.type,
                paymentMethod: transactionData.paymentMethod,
                isRecurring: transactionData.isRecurring ?? false,
                isInstallment: transactionData.isInstallment ?? false,
                installmentNumber: transactionData.installmentNumber,
                totalInstallments: transactionData.totalInstallments,
                paidInstallments: transactionData.isInstallment ? [1] : [],
                recurringId: recurringId,
                actor: { connect: { id: transactionData.actorId } },
            };
            
            if (transactionData.vaultId) {
                createData.vault = { connect: { id: transactionData.vaultId } };
            } else if (transactionData.userId) {
                createData.user = { connect: { id: transactionData.userId } };
            } else {
                throw new Error("Transação deve estar associada a um usuário ou cofre.");
            }

            const ownerIdForCategory = transactionData.actorId;
            if (!ownerIdForCategory) {
                throw new Error("Owner ID (user or vault) is required for category context.");
            }
            createData.category = {
                connectOrCreate: {
                    where: { name_ownerId: { name: transactionData.category, ownerId: ownerIdForCategory } },
                    create: { name: transactionData.category, ownerId: ownerIdForCategory }
                }
            };
            
            if (transactionData.sourceAccountId) createData.sourceAccount = { connect: { id: transactionData.sourceAccountId } };
            if (transactionData.destinationAccountId) createData.destinationAccount = { connect: { id: transactionData.destinationAccountId } };
            if (transactionData.goalId) createData.goal = { connect: { id: transactionData.goalId } };
            
            return await tx.transaction.create({ data: createData });
        };

        const originalTransaction = await createSingleTransaction(data);

        // Lógica de projeção de recorrência
        if (data.isRecurring && data.projectRecurring) {
            const originalDate = new Date(data.date);
            const year = originalDate.getFullYear();
            const startMonth = originalDate.getMonth();

            for (let month = startMonth + 1; month < 12; month++) {
                const futureDate = new Date(year, month, originalDate.getDate());
                await createSingleTransaction(data, futureDate);
            }
        }

        // --- ATUALIZAÇÃO DE SALDOS ---
        if (data.type === 'expense' && data.sourceAccountId) {
            await AccountService.updateBalance(data.sourceAccountId, data.amount, 'expense');
        }
        if (data.type === 'income' && data.destinationAccountId) {
            await AccountService.updateBalance(data.destinationAccountId, data.amount, 'income');
        }
        if (data.type === 'transfer') {
             // Movimentação de/para uma caixinha
            if (data.goalId) {
                // Depósito: Conta -> Caixinha
                if (data.sourceAccountId) {
                    await AccountService.updateBalance(data.sourceAccountId, data.amount, 'expense');
                    await GoalService.addToGoal(data.goalId, data.amount);
                } 
                // Retirada: Caixinha -> Conta
                else if (data.destinationAccountId) {
                    await GoalService.removeFromGoal(data.goalId, data.amount);
                    await AccountService.updateBalance(data.destinationAccountId, data.amount, 'income');
                }
            } 
            // Transferência entre contas bancárias
            else if (data.sourceAccountId && data.destinationAccountId) {
                await AccountService.updateBalance(data.sourceAccountId, data.amount, 'expense');
                await AccountService.updateBalance(data.destinationAccountId, data.amount, 'income');
            }
        }
        
        return originalTransaction;

      } catch (error) {
        console.error('Erro ao criar transação:', error);
        throw new Error('Não foi possível criar a transação');
      }
    });
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
      goalId: string | null;
      isRecurring: boolean;
      isInstallment: boolean;
      installmentNumber: number;
      totalInstallments: number;
      paidInstallments: number[];
    }>
  ): Promise<any> {
    try {
      const updateData: any = { ...data };

      if(data.category) {
        const tx = await prisma.transaction.findUnique({where: {id: transactionId}});
        const ownerId = tx?.actorId;
        if(ownerId) {
            updateData.category = {
                connectOrCreate: {
                    where: { name_ownerId: { name: data.category, ownerId } },
                    create: { name: data.category, ownerId }
                }
            };
        } else {
            delete updateData.category;
        }
      }


      if ('sourceAccountId' in data) {
        updateData.sourceAccount = data.sourceAccountId ? { connect: { id: data.sourceAccountId } } : { disconnect: true };
      }
      if ('destinationAccountId' in data) {
        updateData.destinationAccount = data.destinationAccountId ? { connect: { id: data.destinationAccountId } } : { disconnect: true };
      }
      if ('goalId' in data) {
          updateData.goal = data.goalId ? { connect: { id: data.goalId } } : { disconnect: true };
      }

      delete updateData.sourceAccountId;
      delete updateData.destinationAccountId;
      delete updateData.goalId;
      
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
   * Atualiza o número de parcelas pagas de uma transação.
   */
  static async updatePaidInstallments(transactionId: string, paidInstallments: number[]): Promise<any> {
    try {
      // Como o grupo é representado por uma única transação, atualizamos ela.
      return await prisma.transaction.update({
        where: { id: transactionId },
        data: { paidInstallments: paidInstallments },
      });
    } catch (error) {
      console.error('Erro ao atualizar parcelas pagas:', error);
      throw new Error('Não foi possível atualizar o número de parcelas pagas.');
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
