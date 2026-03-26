import { prisma } from './prisma';
import { AccountService } from './account.service';
import { GoalService } from './goal.service';
import type { PrismaTx } from './account.service';
import type { Prisma, Transaction as PrismaTransaction } from '@prisma/client';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Tipo da transação com relações (resultado dos includes padrão). */
type TransactionWithRelations = PrismaTransaction & {
  category?: { id: string; name: string } | null;
  sourceAccount?: { id: string; name: string; bank: string; type: string; balance: number } | null;
  destinationAccount?: { id: string; name: string; bank: string; type: string; balance: number } | null;
  goal?: { id: string; name: string; currentAmount: number; targetAmount: number } | null;
  actor?: { id: string; name: string; email: string; avatarUrl: string | null } | null;
};

/** Payload para criação de uma transação. */
export type CreateTransactionInput = {
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
  recurringId?: string;
};

/** Include padrão reutilizado em todas as queries de leitura. */
const TRANSACTION_INCLUDE = {
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
} satisfies Prisma.TransactionInclude;


/**
 * TransactionService
 * 
 * Serviço responsável pelas operações de escrita (CRUD) de transações financeiras.
 * Para consultas complexas, use TransactionQueryService.
 * Para análises e cálculos, use TransactionAnalysisService.
 * 
 * Princípios de design:
 * - Métodos públicos orquestram; métodos privados executam responsabilidades isoladas.
 * - Toda operação de escrita roda dentro de `prisma.$transaction` para garantir atomicidade.
 * - Side effects (saldos de contas e goals) usam o client transacional `tx`.
 */
export class TransactionService {

  // =========================================================================
  // LEITURA (sem alterações de lógica, apenas tipagem melhorada)
  // =========================================================================

  /** Busca as transações mais recentes de um contexto (usuário ou vault). */
  static async getRecentTransactions(
    ownerId: string,
    ownerType: 'user' | 'vault',
    limit: number
  ): Promise<TransactionWithRelations[]> {
    try {
      const whereClause: Prisma.TransactionWhereInput =
        ownerType === 'user' ? { userId: ownerId } : { vaultId: ownerId };

      return await prisma.transaction.findMany({
        where: whereClause,
        take: limit,
        include: TRANSACTION_INCLUDE,
        orderBy: { date: 'desc' },
      }) as TransactionWithRelations[];
    } catch (error) {
      console.error('Erro ao buscar transações recentes:', error);
      throw new Error('Não foi possível buscar as transações recentes');
    }
  }

  /** Busca transações de um contexto (usuário ou vault) com suporte a paginação e filtros. */
  static async getTransactions(
    ownerId: string,
    ownerType: 'user' | 'vault',
    options: {
      page?: number;
      limit?: number;
      search?: string;
      type?: 'income' | 'expense' | 'transfer' | 'all';
      month?: string;
      year?: string;
    } = {}
  ): Promise<{ transactions: TransactionWithRelations[]; total: number }> {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        type = 'all', 
        month, 
        year 
      } = options;
      
      const skip = (page - 1) * limit;
      
      const whereClause: Prisma.TransactionWhereInput =
        ownerType === 'user' ? { userId: ownerId } : { vaultId: ownerId };

      if (type && type !== 'all') {
        whereClause.type = type;
      }

      if (search) {
        whereClause.OR = [
          { description: { contains: search, mode: 'insensitive' } },
        ];
        // Se a busca for um número, tenta buscar por valor exato também
        const searchNumber = parseFloat(search.replace(',', '.'));
        if (!isNaN(searchNumber)) {
           whereClause.OR.push({ amount: searchNumber });
        }
      }

      if (month && month !== 'all') {
        const m = parseInt(month);
        const y = year && year !== 'all' ? parseInt(year) : new Date().getFullYear();
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 0, 23, 59, 59);
        whereClause.date = { gte: start, lte: end };
      } else if (year && year !== 'all') {
        const y = parseInt(year);
        const start = new Date(y, 0, 1);
        const end = new Date(y, 11, 31, 23, 59, 59);
        whereClause.date = { gte: start, lte: end };
      }

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where: whereClause,
          include: TRANSACTION_INCLUDE,
          orderBy: { date: 'desc' },
          skip,
          take: limit,
        }) as Promise<TransactionWithRelations[]>,
        prisma.transaction.count({ where: whereClause }),
      ]);

      return { transactions, total };
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      throw new Error('Não foi possível buscar as transações');
    }
  }

  /** Retorna o total de transações de um contexto para cálculo de paginação. */
  static async getTransactionsCount(
    ownerId: string,
    ownerType: 'user' | 'vault'
  ): Promise<number> {
    try {
      const whereClause: Prisma.TransactionWhereInput =
        ownerType === 'user' ? { userId: ownerId } : { vaultId: ownerId };
      return await prisma.transaction.count({ where: whereClause });
    } catch (error) {
      console.error('Erro ao contar transações:', error);
      throw new Error('Não foi possível contar as transações');
    }
  }

  /** Busca transações para uma meta específica. */
  static async getTransactionsForGoal(goalId: string): Promise<TransactionWithRelations[]> {
    try {
      return await prisma.transaction.findMany({
        where: { goalId },
        include: {
          category: true,
          actor: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
        orderBy: { date: 'desc' },
      }) as TransactionWithRelations[];
    } catch (error) {
      console.error('Erro ao buscar transações da meta:', error);
      throw new Error('Não foi possível buscar as transações da meta');
    }
  }
  
  /** Busca transações do mês atual para um determinado contexto. */
  static async getCurrentMonthTransactions(
    ownerId: string,
    ownerType: 'user' | 'vault'
  ): Promise<TransactionWithRelations[]> {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const whereClause: Prisma.TransactionWhereInput =
        ownerType === 'user' ? { userId: ownerId } : { vaultId: ownerId };

      return await prisma.transaction.findMany({
        where: {
          ...whereClause,
          date: { gte: firstDayOfMonth, lte: lastDayOfMonth },
        },
        include: TRANSACTION_INCLUDE,
        orderBy: { date: 'desc' },
      }) as TransactionWithRelations[];
    } catch (error) {
      console.error('Erro ao buscar transações do mês:', error);
      throw new Error('Não foi possível buscar as transações do mês');
    }
  }

  /** Busca uma transação única por seu ID. */
  static async getTransactionById(transactionId: string): Promise<TransactionWithRelations | null> {
    try {
      return await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: TRANSACTION_INCLUDE,
      }) as TransactionWithRelations | null;
    } catch (error) {
      console.error('Erro ao buscar transação:', error);
      throw new Error('Não foi possível buscar a transação');
    }
  }

  // =========================================================================
  // ESCRITA — CREATE
  // =========================================================================

  /**
   * Cria uma nova transação no banco de dados.
   * 
   * Toda a operação (criar registro, projetar recorrências, atualizar saldos)
   * roda dentro de uma ÚNICA `prisma.$transaction` para garantir atomicidade.
   */
  static async createTransaction(data: CreateTransactionInput): Promise<PrismaTransaction> {
    return prisma.$transaction(async (tx) => {
      try {
        const recurringId = data.recurringId || (data.isRecurring ? require('crypto').randomUUID() : null);

        // 1. Criar a transação principal
        const originalTransaction = await this.buildAndCreateRecord(tx, data, recurringId);

        // 2. Projetar recorrências (se aplicável)
        if (data.isRecurring && data.projectRecurring) {
          await this.projectRecurringCopies(tx, data, recurringId);
        }

        // 3. Atualizar saldos (contas e goals) — dentro da mesma transação
        await this.applyBalanceSideEffects(tx, data);

        return originalTransaction;
      } catch (error) {
        console.error('Erro ao criar transação:', error);
        throw new Error('Não foi possível criar a transação');
      }
    });
  }

  // =========================================================================
  // ESCRITA — UPDATE (com compensação de saldos)
  // =========================================================================

  /**
   * Atualiza uma transação existente.
   * 
   * Fluxo de compensação de saldos:
   * 1. Busca a transação original (antes da edição)
   * 2. REVERTE os side effects financeiros da transação original
   * 3. Atualiza o registro no BD
   * 4. APLICA os side effects financeiros com os novos dados
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
  ): Promise<PrismaTransaction> {
    return prisma.$transaction(async (tx) => {
      try {
        // 1. Buscar a transação original ANTES da edição
        const original = await tx.transaction.findUnique({
          where: { id: transactionId },
          include: { category: true },
        });

        if (!original) {
          throw new Error('Transação não encontrada');
        }

        // 2. REVERTER os side effects financeiros da transação original
        await this.reverseBalanceSideEffects(tx, {
          type: original.type as CreateTransactionInput['type'],
          amount: original.amount,
          sourceAccountId: original.sourceAccountId,
          destinationAccountId: original.destinationAccountId,
          goalId: original.goalId,
        });

        // 3. Montar o payload de update
        const updateData: Prisma.TransactionUpdateInput = {};

        if (data.date !== undefined) updateData.date = data.date;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.amount !== undefined) updateData.amount = data.amount;
        if (data.type !== undefined) updateData.type = data.type;
        if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
        if (data.isRecurring !== undefined) updateData.isRecurring = data.isRecurring;
        if (data.isInstallment !== undefined) updateData.isInstallment = data.isInstallment;
        if (data.installmentNumber !== undefined) updateData.installmentNumber = data.installmentNumber;
        if (data.totalInstallments !== undefined) updateData.totalInstallments = data.totalInstallments;

        // paidInstallments — normalizar para array
        if (data.paidInstallments !== undefined) {
          if (Array.isArray(data.paidInstallments)) {
            updateData.paidInstallments = data.paidInstallments;
          } else {
            updateData.paidInstallments = [];
          }
        }

        // Categoria — connectOrCreate
        if (data.category) {
          const ownerId = original.actorId;
          updateData.category = {
            connectOrCreate: {
              where: { name_ownerId: { name: data.category, ownerId } },
              create: { name: data.category, ownerId },
            },
          };
        }

        // Relações opcionais — connect/disconnect
        if ('sourceAccountId' in data) {
          updateData.sourceAccount = data.sourceAccountId
            ? { connect: { id: data.sourceAccountId } }
            : { disconnect: true };
        }
        if ('destinationAccountId' in data) {
          updateData.destinationAccount = data.destinationAccountId
            ? { connect: { id: data.destinationAccountId } }
            : { disconnect: true };
        }
        if ('goalId' in data) {
          updateData.goal = data.goalId
            ? { connect: { id: data.goalId } }
            : { disconnect: true };
        }

        // 4. Persistir a atualização
        const updatedTransaction = await tx.transaction.update({
          where: { id: transactionId },
          data: updateData,
        });

        // 5. APLICAR os side effects financeiros com os novos dados
        const newEffectData: BalanceSideEffectInput = {
          type: (data.type ?? original.type) as CreateTransactionInput['type'],
          amount: data.amount ?? original.amount,
          sourceAccountId: 'sourceAccountId' in data ? (data.sourceAccountId ?? null) : original.sourceAccountId,
          destinationAccountId: 'destinationAccountId' in data ? (data.destinationAccountId ?? null) : original.destinationAccountId,
          goalId: 'goalId' in data ? (data.goalId ?? null) : original.goalId,
        };
        await this.applyBalanceSideEffects(tx, newEffectData);

        return updatedTransaction;
      } catch (error) {
        console.error('Erro ao atualizar transação:', error);
        throw new Error('Não foi possível atualizar a transação');
      }
    });
  }

  // =========================================================================
  // ESCRITA — DELETE (com reversão de saldos)
  // =========================================================================

  /**
   * Deleta uma transação do banco de dados.
   * Reverte automaticamente os side effects financeiros (saldos de contas e goals).
   */
  static async deleteTransaction(transactionId: string): Promise<void> {
    return prisma.$transaction(async (tx) => {
      try {
        // 1. Buscar a transação para conhecer os side effects a reverter
        const transaction = await tx.transaction.findUnique({
          where: { id: transactionId },
        });

        if (!transaction) {
          throw new Error('Transação não encontrada');
        }

        // 2. Reverter side effects financeiros
        await this.reverseBalanceSideEffects(tx, {
          type: transaction.type as CreateTransactionInput['type'],
          amount: transaction.amount,
          sourceAccountId: transaction.sourceAccountId,
          destinationAccountId: transaction.destinationAccountId,
          goalId: transaction.goalId,
        });

        // 3. Deletar o registro
        await tx.transaction.delete({
          where: { id: transactionId },
        });
      } catch (error) {
        console.error('Erro ao deletar transação:', error);
        throw new Error('Não foi possível deletar a transação');
      }
    });
  }

  // =========================================================================
  // ESCRITA — PARCELAS (updatePaidInstallments)
  // =========================================================================

  /**
   * Atualiza o número de parcelas pagas de uma transação.
   * Cria ou remove transações filhas conforme parcelas são marcadas/desmarcadas.
   */
  static async updatePaidInstallments(transactionId: string, paidInstallments: number[]): Promise<{ success: boolean }> {
    try {
      const masterTx = await prisma.transaction.findUnique({ 
        where: { id: transactionId },
        include: { category: true },
      });
      
      if (!masterTx) throw new Error('Transação não encontrada');

      // Garantir recurringId no Master
      let recurringId = masterTx.recurringId;
      if (!recurringId) {
        recurringId = require('crypto').randomUUID();
        await prisma.transaction.update({ 
          where: { id: transactionId }, 
          data: { recurringId },
        });
      }

      // Atualizar Master
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { paidInstallments },
      });

      // Gerenciar transações filhas (parcelas 2..N)
      if (masterTx.totalInstallments && masterTx.totalInstallments > 1) {
        for (let i = 2; i <= masterTx.totalInstallments; i++) {
          const isPaid = paidInstallments.includes(i);
          
          const childTx = await prisma.transaction.findFirst({
            where: {
              recurringId,
              installmentNumber: i,
            },
          });

          if (isPaid && !childTx) {
            // Criar transação para a parcela
            const targetDate = new Date(masterTx.date);
            targetDate.setMonth(targetDate.getMonth() + (i - 1));
            
            // Clamping de dia
            const originalDay = masterTx.date.getDate();
            const daysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
            targetDate.setDate(Math.min(originalDay, daysInMonth));

            await this.createTransaction({
              date: targetDate,
              description: masterTx.description,
              amount: masterTx.amount,
              type: masterTx.type as CreateTransactionInput['type'],
              category: masterTx.category?.name || 'Outros',
              actorId: masterTx.actorId,
              paymentMethod: masterTx.paymentMethod,
              sourceAccountId: masterTx.sourceAccountId,
              destinationAccountId: masterTx.destinationAccountId,
              goalId: masterTx.goalId,
              isRecurring: false,
              isInstallment: true,
              installmentNumber: i,
              totalInstallments: masterTx.totalInstallments,
              paidInstallments: [i],
              userId: masterTx.userId || undefined,
              vaultId: masterTx.vaultId || undefined,
              recurringId: recurringId || undefined,
            });
          } else if (!isPaid && childTx) {
            // Remover transação se foi desmarcada
            await this.deleteTransaction(childTx.id);
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar parcelas pagas:', error);
      throw new Error('Não foi possível atualizar o número de parcelas pagas.');
    }
  }

  // =========================================================================
  // RECORRÊNCIAS — Processamento Lazy
  // =========================================================================

  /**
   * Processa transações recorrentes (Lazy Approach).
   * Verifica se há transações recorrentes que precisam ser geradas para o mês atual.
   */
  static async processRecurringTransactions(userId: string): Promise<void> {
    try {
      const recurringGroups = await prisma.transaction.groupBy({
        by: ['recurringId'],
        where: {
          OR: [
            { userId },
            { actorId: userId },
          ],
          isRecurring: true,
          recurringId: { not: null },
        },
        _max: { date: true },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const group of recurringGroups) {
        if (!group.recurringId || !group._max.date) continue;

        // Buscar a primeira transação para estabelecer o dia "âncora"
        const firstTransaction = await prisma.transaction.findFirst({
          where: { recurringId: group.recurringId },
          orderBy: { date: 'asc' },
          select: { date: true },
        });
        
        if (!firstTransaction) continue;
        const anchorDay = firstTransaction.date.getDate();

        let lastDate = new Date(group._max.date);
        
        // Loop para "catch up" (criar todas as pendentes até hoje)
        while (true) {
          const targetMonth = (lastDate.getMonth() + 1) % 12;
          const targetYear = lastDate.getFullYear() + (lastDate.getMonth() + 1 >= 12 ? 1 : 0);
          
          const nextDate = new Date(targetYear, targetMonth, 1);
          const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
          nextDate.setDate(Math.min(anchorDay, daysInMonth));

          if (nextDate > today) break;

          const templateTransaction = await prisma.transaction.findFirst({
            where: {
              recurringId: group.recurringId,
              date: lastDate,
            },
            include: { category: true },
          });

          if (!templateTransaction) break;

          await this.createTransaction({
            date: nextDate,
            description: templateTransaction.description,
            amount: templateTransaction.amount,
            type: templateTransaction.type as CreateTransactionInput['type'],
            paymentMethod: templateTransaction.paymentMethod,
            isRecurring: true,
            projectRecurring: false,
            userId: templateTransaction.userId || undefined,
            vaultId: templateTransaction.vaultId || undefined,
            actorId: templateTransaction.actorId,
            sourceAccountId: templateTransaction.sourceAccountId || undefined,
            destinationAccountId: templateTransaction.destinationAccountId || undefined,
            goalId: templateTransaction.goalId || undefined,
            category: templateTransaction.category?.name || 'Outros',
          });

          lastDate = nextDate;
        }
      }
    } catch (error) {
      console.error('Erro ao processar transações recorrentes:', error);
      // Não lançar erro para não quebrar o dashboard
    }
  }

  // =========================================================================
  // MÉTODOS PRIVADOS — Responsabilidades Isoladas
  // =========================================================================

  /**
   * Constrói o payload Prisma e persiste UMA transação no banco.
   * Responsabilidade: apenas a criação do registro, sem side effects.
   */
  private static async buildAndCreateRecord(
    tx: PrismaTx,
    data: CreateTransactionInput,
    recurringId: string | null,
    customDate?: Date
  ): Promise<PrismaTransaction> {
    const createData: Prisma.TransactionCreateInput = {
      date: customDate || data.date,
      description: data.description,
      amount: data.amount,
      type: data.type,
      paymentMethod: data.paymentMethod,
      isRecurring: data.isRecurring ?? false,
      isInstallment: data.isInstallment ?? false,
      installmentNumber: data.installmentNumber,
      totalInstallments: data.totalInstallments,
      paidInstallments: data.paidInstallments || (data.isInstallment ? [1] : []),
      recurringId,
      actor: { connect: { id: data.actorId } },
    };

    // Ownership — exatamente um de userId ou vaultId
    if (data.vaultId) {
      createData.vault = { connect: { id: data.vaultId } };
    } else if (data.userId) {
      createData.user = { connect: { id: data.userId } };
    } else {
      throw new Error('Transação deve estar associada a um usuário ou cofre.');
    }

    // Categoria — connectOrCreate usando actorId como ownerId
    const ownerIdForCategory = data.actorId;
    createData.category = {
      connectOrCreate: {
        where: { name_ownerId: { name: data.category, ownerId: ownerIdForCategory } },
        create: { name: data.category, ownerId: ownerIdForCategory },
      },
    };

    // Relações opcionais
    if (data.sourceAccountId) createData.sourceAccount = { connect: { id: data.sourceAccountId } };
    if (data.destinationAccountId) createData.destinationAccount = { connect: { id: data.destinationAccountId } };
    if (data.goalId) createData.goal = { connect: { id: data.goalId } };

    return tx.transaction.create({ data: createData });
  }

  /**
   * Projeta cópias recorrentes até o fim do ano da data original.
   * Chamado apenas quando `isRecurring && projectRecurring` é true.
   */
  private static async projectRecurringCopies(
    tx: PrismaTx,
    data: CreateTransactionInput,
    recurringId: string | null
  ): Promise<void> {
    const originalDate = new Date(data.date);
    const year = originalDate.getFullYear();
    const startMonth = originalDate.getMonth();

    for (let month = startMonth + 1; month < 12; month++) {
      const futureDate = new Date(year, month, originalDate.getDate());
      await this.buildAndCreateRecord(tx, data, recurringId, futureDate);
    }
  }

  /**
   * Aplica os side effects financeiros de uma transação:
   * - Atualiza saldos de contas (AccountService)
   * - Atualiza saldos de goals (GoalService)
   * 
   * Tudo dentro do `tx` transacional para garantir atomicidade.
   */
  private static async applyBalanceSideEffects(
    tx: PrismaTx,
    data: BalanceSideEffectInput
  ): Promise<void> {
    if (data.type === 'expense' && data.sourceAccountId) {
      await AccountService.updateBalance(data.sourceAccountId, data.amount, 'expense', tx);
    }

    if (data.type === 'income' && data.destinationAccountId) {
      await AccountService.updateBalance(data.destinationAccountId, data.amount, 'income', tx);
    }

    if (data.type === 'transfer') {
      if (data.goalId) {
        // Depósito: Conta → Caixinha
        if (data.sourceAccountId) {
          await AccountService.updateBalance(data.sourceAccountId, data.amount, 'expense', tx);
          await GoalService.addToGoal(data.goalId, data.amount, tx);
        }
        // Retirada: Caixinha → Conta
        else if (data.destinationAccountId) {
          await GoalService.removeFromGoal(data.goalId, data.amount, tx);
          await AccountService.updateBalance(data.destinationAccountId, data.amount, 'income', tx);
        }
      }
      // Transferência entre contas bancárias
      else if (data.sourceAccountId && data.destinationAccountId) {
        await AccountService.updateBalance(data.sourceAccountId, data.amount, 'expense', tx);
        await AccountService.updateBalance(data.destinationAccountId, data.amount, 'income', tx);
      }
    }
  }

  /**
   * Reverte os side effects financeiros de uma transação.
   * É o inverso exato de `applyBalanceSideEffects`.
   * Usado no update (antes de reaplicar com novos dados) e no delete.
   */
  private static async reverseBalanceSideEffects(
    tx: PrismaTx,
    data: BalanceSideEffectInput
  ): Promise<void> {
    if (data.type === 'expense' && data.sourceAccountId) {
      // Reverter: devolver para a conta
      await AccountService.updateBalance(data.sourceAccountId, data.amount, 'income', tx);
    }

    if (data.type === 'income' && data.destinationAccountId) {
      // Reverter: remover da conta
      await AccountService.updateBalance(data.destinationAccountId, data.amount, 'expense', tx);
    }

    if (data.type === 'transfer') {
      if (data.goalId) {
        // Reverter depósito: devolver para conta, retirar da caixinha
        if (data.sourceAccountId) {
          await AccountService.updateBalance(data.sourceAccountId, data.amount, 'income', tx);
          await GoalService.removeFromGoal(data.goalId, data.amount, tx);
        }
        // Reverter retirada: devolver para caixinha, remover da conta
        else if (data.destinationAccountId) {
          await GoalService.addToGoal(data.goalId, data.amount, tx);
          await AccountService.updateBalance(data.destinationAccountId, data.amount, 'expense', tx);
        }
      }
      // Reverter transferência entre contas
      else if (data.sourceAccountId && data.destinationAccountId) {
        await AccountService.updateBalance(data.sourceAccountId, data.amount, 'income', tx);
        await AccountService.updateBalance(data.destinationAccountId, data.amount, 'expense', tx);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Tipos internos (não exportados)
// ---------------------------------------------------------------------------

/** Dados mínimos necessários para aplicar/reverter side effects financeiros. */
type BalanceSideEffectInput = {
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  sourceAccountId?: string | null;
  destinationAccountId?: string | null;
  goalId?: string | null;
};
