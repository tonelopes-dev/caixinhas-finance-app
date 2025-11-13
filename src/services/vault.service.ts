
import prisma from './prisma';

export type VaultWithMembers = {
  id: string;
  name: string;
  imageUrl: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  members: {
    id: string;
    userId: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl: string | null;
    };
  }[];
};

export type CreateVaultInput = {
  name: string;
  imageUrl?: string;
  ownerId: string;
};

export type UpdateVaultInput = {
  name?: string;
  imageUrl?: string;
};

export type VaultInvitationData = {
  id: string;
  type: string;
  targetId: string;
  targetName: string;
  senderId: string;
  receiverId: string;
  status: string;
  sender: {
    name: string;
  };
};

/**
 * VaultService - Serviço de gerenciamento de cofres
 * Responsável por criar, listar, atualizar e deletar cofres
 */
export class VaultService {
  /**
   * Busca todos os cofres de um usuário (onde ele é membro)
   * @param userId - ID do usuário
   * @returns Lista de cofres com membros
   */
  static async getUserVaults(userId: string): Promise<VaultWithMembers[]> {
    try {
      // Buscar cofres onde o usuário é membro
      const vaultMemberships = await prisma.vaultMember.findMany({
        where: { userId },
        include: {
          vault: {
            include: {
              members: {
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
          },
        },
      });

      // Transformar para o formato esperado
      return vaultMemberships.map((membership: any) => membership.vault);
    } catch (error) {
      console.error('Erro ao buscar cofres do usuário:', error);
      throw new Error('Erro ao buscar cofres');
    }
  }

  /**
   * Busca um cofre por ID com seus membros
   * @param vaultId - ID do cofre
   * @returns Cofre com membros ou null
   */
  static async getVaultById(vaultId: string): Promise<VaultWithMembers | null> {
    try {
      const vault = await prisma.vault.findUnique({
        where: { id: vaultId },
        include: {
          members: {
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

      return vault;
    } catch (error) {
      console.error('Erro ao buscar cofre:', error);
      return null;
    }
  }

  /**
   * Cria um novo cofre
   * @param data - Dados do cofre
   * @returns Cofre criado
   */
  static async createVault(data: CreateVaultInput): Promise<VaultWithMembers> {
    try {
      const vault = await prisma.vault.create({
        data: {
          name: data.name,
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1080',
          ownerId: data.ownerId,
          members: {
            create: {
              userId: data.ownerId,
              role: 'owner',
            },
          },
        },
        include: {
          members: {
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

      return vault;
    } catch (error) {
      console.error('Erro ao criar cofre:', error);
      throw new Error('Erro ao criar cofre');
    }
  }

  /**
   * Atualiza um cofre
   * @param vaultId - ID do cofre
   * @param data - Dados a serem atualizados
   * @returns Cofre atualizado
   */
  static async updateVault(
    vaultId: string,
    data: UpdateVaultInput
  ): Promise<VaultWithMembers> {
    try {
      const vault = await prisma.vault.update({
        where: { id: vaultId },
        data,
        include: {
          members: {
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

      return vault;
    } catch (error) {
      console.error('Erro ao atualizar cofre:', error);
      throw new Error('Erro ao atualizar cofre');
    }
  }

  /**
   * Deleta um cofre
   * @param vaultId - ID do cofre
   */
  static async deleteVault(vaultId: string): Promise<void> {
    try {
      await prisma.vault.delete({
        where: { id: vaultId },
      });
    } catch (error) {
      console.error('Erro ao deletar cofre:', error);
      throw new Error('Erro ao deletar cofre');
    }
  }

  /**
   * Adiciona um membro a um cofre
   * @param vaultId - ID do cofre
   * @param userId - ID do usuário
   * @param role - Papel do usuário no cofre
   */
  static async addMember(
    vaultId: string,
    userId: string,
    role: 'member' | 'admin' = 'member'
  ): Promise<void> {
    try {
      await prisma.vaultMember.create({
        data: {
          vaultId,
          userId,
          role,
        },
      });
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      throw new Error('Erro ao adicionar membro');
    }
  }

  /**
   * Remove um membro de um cofre
   * @param vaultId - ID do cofre
   * @param userId - ID do usuário
   */
  static async removeMember(vaultId: string, userId: string): Promise<void> {
    try {
      await prisma.vaultMember.deleteMany({
        where: {
          vaultId,
          userId,
        },
      });
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      throw new Error('Erro ao remover membro');
    }
  }

  /**
   * Verifica se um usuário é membro de um cofre
   * @param vaultId - ID do cofre
   * @param userId - ID do usuário
   * @returns true se for membro
   */
  static async isMember(vaultId: string, userId: string): Promise<boolean> {
    try {
      const member = await prisma.vaultMember.findFirst({
        where: {
          vaultId,
          userId,
        },
      });

      return !!member;
    } catch (error) {
      console.error('Erro ao verificar membro:', error);
      return false;
    }
  }

  /**
   * Busca convites pendentes para um usuário
   * @param userId - ID do usuário
   * @returns Lista de convites
   */
  static async getPendingInvitations(userId: string): Promise<VaultInvitationData[]> {
    try {
      const invitations = await prisma.invitation.findMany({
        where: {
          receiverId: userId,
          type: 'vault',
          status: 'pending',
        },
        include: {
          sender: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return invitations;
    } catch (error) {
      console.error('Erro ao buscar convites:', error);
      return [];
    }
  }

  /**
   * Aceita um convite de cofre
   * @param invitationId - ID do convite
   * @param userId - ID do usuário que está aceitando
   */
  static async acceptInvitation(invitationId: string, userId: string): Promise<void> {
    try {
      // Buscar o convite
      const invitation = await prisma.invitation.findUnique({
        where: { id: invitationId },
      });

      if (!invitation || invitation.receiverId !== userId) {
        throw new Error('Convite não encontrado ou inválido');
      }

      // Adicionar como membro do cofre
      await prisma.vaultMember.create({
        data: {
          vaultId: invitation.targetId,
          userId,
          role: 'member',
        },
      });

      // Atualizar status do convite
      await prisma.invitation.update({
        where: { id: invitationId },
        data: { status: 'accepted' },
      });
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      throw new Error('Erro ao aceitar convite');
    }
  }

  /**
   * Recusa um convite de cofre
   * @param invitationId - ID do convite
   * @param userId - ID do usuário que está recusando
   */
  static async declineInvitation(invitationId: string, userId: string): Promise<void> {
    try {
      const invitation = await prisma.invitation.findUnique({
        where: { id: invitationId },
      });

      if (!invitation || invitation.receiverId !== userId) {
        throw new Error('Convite não encontrado ou inválido');
      }

      await prisma.invitation.update({
        where: { id: invitationId },
        data: { status: 'declined' },
      });
    } catch (error) {
      console.error('Erro ao recusar convite:', error);
      throw new Error('Erro ao recusar convite');
    }
  }
}
