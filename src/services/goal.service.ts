
import { prisma } from './prisma';

/**
 * GoalService
 * 
 * Serviço responsável por gerenciar caixinhas/metas financeiras.
 */
export class GoalService {
  /**
   * Busca todas as metas de um usuário
   */
  static async getUserGoals(userId: string): Promise<any[]> {
    try {
      return await prisma.goal.findMany({
        where: {
          userId: userId,
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error('Erro ao buscar metas do usuário:', error);
      throw new Error('Não foi possível buscar as metas do usuário');
    }
  }

  /**
   * Busca todas as metas de um cofre
   */
  static async getVaultGoals(vaultId: string): Promise<any[]> {
    try {
      return await prisma.goal.findMany({
        where: {
          vaultId: vaultId,
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error('Erro ao buscar metas do cofre:', error);
      throw new Error('Não foi possível buscar as metas do cofre');
    }
  }

  /**
   * Busca metas de um contexto (usuário ou vault)
   */
  static async getGoals(ownerId: string, ownerType: 'user' | 'vault'): Promise<any[]> {
    try {
      const whereClause = ownerType === 'user' ? { userId: ownerId } : { vaultId: ownerId };
      return await prisma.goal.findMany({
        where: whereClause,
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
      throw new Error('Não foi possível buscar as metas');
    }
  }

  /**
   * Busca uma meta por ID
   */
  static async getGoalById(goalId: string): Promise<any | null> {
    try {
      return await prisma.goal.findUnique({
        where: { id: goalId },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error('Erro ao buscar meta:', error);
      throw new Error('Não foi possível buscar a meta');
    }
  }

  /**
   * Cria uma nova meta
   */
  static async createGoal(data: {
    name: string;
    targetAmount: number;
    emoji: string;
    ownerId: string;
    ownerType: 'user' | 'vault';
    currentAmount?: number;
    visibility?: string;
    isFeatured?: boolean;
  }): Promise<any> {
    try {
      const isPersonal = data.ownerType === 'user';
      return await prisma.goal.create({
        data: {
          name: data.name,
          targetAmount: data.targetAmount,
          currentAmount: data.currentAmount || 0,
          emoji: data.emoji,
          visibility: data.visibility || 'shared',
          isFeatured: data.isFeatured ?? false,
          userId: isPersonal ? data.ownerId : undefined,
          vaultId: !isPersonal ? data.ownerId : undefined,
          ownerType: data.ownerType, // Adicionando ownerType
          ownerId: data.ownerId, // Adicionando ownerId
        },
      });
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      throw new Error('Não foi possível criar a meta');
    }
  }

  /**
   * Atualiza uma meta existente
   */
  static async updateGoal(
    goalId: string,
    data: Partial<{
      name: string;
      targetAmount: number;
      currentAmount: number;
      emoji: string;
      visibility: string;
      isFeatured: boolean;
    }>
  ): Promise<any> {
    try {
      return await prisma.goal.update({
        where: { id: goalId },
        data,
      });
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      throw new Error('Não foi possível atualizar a meta');
    }
  }

  /**
   * Deleta uma meta
   */
  static async deleteGoal(goalId: string): Promise<void> {
    try {
      await prisma.goal.delete({
        where: { id: goalId },
      });
    } catch (error) {
      console.error('Erro ao deletar meta:', error);
      throw new Error('Não foi possível deletar a meta');
    }
  }

  /**
   * Adiciona um valor à meta (depósito)
   */
  static async addToGoal(goalId: string, amount: number): Promise<any> {
    try {
      const goal = await prisma.goal.findUnique({
        where: { id: goalId },
      });

      if (!goal) {
        throw new Error('Meta não encontrada');
      }

      return await prisma.goal.update({
        where: { id: goalId },
        data: {
          currentAmount: goal.currentAmount + amount,
        },
      });
    } catch (error) {
      console.error('Erro ao adicionar valor à meta:', error);
      throw new Error('Não foi possível adicionar valor à meta');
    }
  }

  /**
   * Remove um valor da meta (retirada)
   */
  static async removeFromGoal(goalId: string, amount: number): Promise<any> {
    try {
      const goal = await prisma.goal.findUnique({
        where: { id: goalId },
      });

      if (!goal) {
        throw new Error('Meta não encontrada');
      }

      const newAmount = Math.max(0, goal.currentAmount - amount);

      return await prisma.goal.update({
        where: { id: goalId },
        data: {
          currentAmount: newAmount,
        },
      });
    } catch (error) {
      console.error('Erro ao remover valor da meta:', error);
      throw new Error('Não foi possível remover valor da meta');
    }
  }

  /**
   * Adiciona um participante a uma meta
   */
  static async addParticipant(
    goalId: string,
    userId: string,
    role: string = 'member'
  ): Promise<any> {
    try {
      return await prisma.goalParticipant.create({
        data: {
          goalId,
          userId,
          role,
        },
      });
    } catch (error) {
      console.error('Erro ao adicionar participante:', error);
      throw new Error('Não foi possível adicionar participante à meta');
    }
  }

  /**
   * Remove um participante de uma meta
   */
  static async removeParticipant(goalId: string, userId: string): Promise<void> {
    try {
      await prisma.goalParticipant.deleteMany({
        where: {
          goalId,
          userId,
        },
      });
    } catch (error) {
      console.error('Erro ao remover participante:', error);
      throw new Error('Não foi possível remover participante da meta');
    }
  }

  /**
   * Calcula o progresso de uma meta (porcentagem)
   */
  static calculateProgress(currentAmount: number, targetAmount: number): number {
    if (targetAmount === 0) return 0;
    return Math.min(100, (currentAmount / targetAmount) * 100);
  }

  /**
   * Calcula o total guardado em metas de um contexto
   */
  static async calculateTotalSaved(ownerId: string, ownerType: 'user' | 'vault'): Promise<number> {
    try {
      const whereClause = ownerType === 'user' ? { userId: ownerId } : { vaultId: ownerId };
      const goals = await prisma.goal.findMany({
        where: whereClause,
      });

      return goals.reduce((sum: number, goal: any) => sum + goal.currentAmount, 0);
    } catch (error) {
      console.error('Erro ao calcular total guardado:', error);
      throw new Error('Não foi possível calcular o total guardado');
    }
  }

  /**
   * Busca metas em destaque
   */
  static async getFeaturedGoals(ownerId: string, ownerType: 'user' | 'vault'): Promise<any[]> {
    try {
      const whereClause = ownerType === 'user' ? { userId: ownerId, isFeatured: true } : { vaultId: ownerId, isFeatured: true };
      return await prisma.goal.findMany({
        where: whereClause,
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error('Erro ao buscar metas em destaque:', error);
      throw new Error('Não foi possível buscar as metas em destaque');
    }
  }

  /**
   * Alterna o status de destaque de uma meta
   */
  static async toggleFeatured(goalId: string): Promise<any> {
    try {
      const goal = await prisma.goal.findUnique({
        where: { id: goalId },
      });

      if (!goal) {
        throw new Error('Meta não encontrada');
      }

      return await prisma.goal.update({
        where: { id: goalId },
        data: {
          isFeatured: !goal.isFeatured,
        },
      });
    } catch (error) {
      console.error('Erro ao alternar destaque:', error);
      throw new Error('Não foi possível alternar o destaque da meta');
    }
  }
}
