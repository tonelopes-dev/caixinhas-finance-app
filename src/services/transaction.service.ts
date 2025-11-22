
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
  }): Promise<any> {
    return prisma.$transaction(async (tx) => {
      try {
        const createData: any = {
          date: data.date,
          description: data.description,
          amount: data.amount,
          type: data.type,
          paymentMethod: data.paymentMethod,
          isRecurring: data.isRecurring ?? false,
          isInstallment: data.isInstallment ?? false,
          installmentNumber: data.installmentNumber,
          totalInstallments: data.totalInstallments,
          actor: { connect: { id: data.actorId } },
        };
        
        // Define o owner da transação (user ou vault)
        if (data.vaultId) {
          createData.vault = { connect: { id: data.vaultId } };
        } else if (data.userId) {
          createData.user = { connect: { id: data.userId } };
        } else {
          throw new Error("Transação deve estar associada a um usuário ou cofre.");
        }

        const ownerIdForCategory = data.userId || data.vaultId;
        if (!ownerIdForCategory) {
            throw new Error("Owner ID (user or vault) is required for category context.");
        }
        createData.category = {
            connectOrCreate: {
                where: { name_ownerId: { name: data.category, ownerId: ownerIdForCategory } },
                create: { name: data.category, ownerId: ownerIdForCategory }
            }
        };
        
        // Conecta as contas e metas, se existirem
        if (data.sourceAccountId) {
          createData.sourceAccount = { connect: { id: data.sourceAccountId } };
        }
        if (data.destinationAccountId) {
          createData.destinationAccount = { connect: { id: data.destinationAccountId } };
        }
        if (data.goalId) {
          createData.goal = { connect: { id: data.goalId } };
        }
        
        const transaction = await tx.transaction.create({ data: createData });

        // Atualizar saldos
        if (data.type === 'expense' && data.sourceAccountId) {
            await AccountService.updateBalance(data.sourceAccountId, data.amount, 'expense');
        }
        if (data.type === 'income' && data.destinationAccountId) {
            await AccountService.updateBalance(data.destinationAccountId, data.amount, 'income');
        }
        if (data.type === 'transfer') {
            if (data.sourceAccountId) {
                if (data.goalId === data.sourceAccountId) { // Retirada de meta
                    await GoalService.removeFromGoal(data.goalId, data.amount);
                } else { // Transferência de conta
                    await AccountService.updateBalance(data.sourceAccountId, data.amount, 'expense');
                }
            }
            if (data.destinationAccountId) {
                 if (data.goalId === data.destinationAccountId) { // Depósito em meta
                    await GoalService.addToGoal(data.goalId, data.amount);
                } else { // Transferência para conta
                    await AccountService.updateBalance(data.destinationAccountId, data.amount, 'income');
                }
            }
        }
        
        return transaction;

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
    }>
  ): Promise<any> {
    // A lógica de transação para atualização é mais complexa
    // pois precisamos reverter o efeito da transação antiga antes de aplicar o novo.
    // Por simplicidade, esta função apenas atualiza os dados da transação sem ajustar os saldos.
    try {
      const updateData: any = { ...data };

      if(data.category) {
        const tx = await prisma.transaction.findUnique({where: {id: transactionId}});
        const ownerId = tx?.userId || tx?.vaultId;
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
   * Deleta uma transação do banco de dados.
   */
  static async deleteTransaction(transactionId: string): Promise<void> {
    // Similar à atualização, a exclusão em uma transação real
    // deveria reverter o impacto da transação nos saldos das contas/metas.
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
