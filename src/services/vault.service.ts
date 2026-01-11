import prisma from './prisma';

export type VaultWithMembers = {
  id: string;
  name: string;
  imageUrl: string | null;
  isPrivate: boolean;
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
  isPrivate?: boolean;
  ownerId: string;
};

export type UpdateVaultInput = {
  name?: string;
  imageUrl?: string;
  isPrivate?: boolean;
};

export type VaultInvitationData = {
  id: string;
  type: string;
  targetId: string;
  targetName: string;
  senderId: string;
  receiverId: string | null;
  receiverEmail: string | null;
  status: string;
  createdAt: Date;
  sender: {
    name: string;
    avatarUrl: string | null;
  };
  vault: {
    name: string;
    imageUrl: string | null;
    members: {
      user: {
        id: string;
        name: string;
        avatarUrl: string | null;
      };
    }[];
  } | null;
  receiver?: {
    name: string;
    email: string;
    avatarUrl: string | null;
  } | null;
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
          isPrivate: data.isPrivate || false,
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
   * Cria um convite para um cofre
   */
  static async createInvitation(
    vaultId: string, 
    senderId: string, 
    receiverEmail: string,
    context?: { source: 'goal', goalName: string } // Contexto opcional
  ): Promise<void> {
    try {
        const [vault, sender] = await Promise.all([
            prisma.vault.findUnique({ where: { id: vaultId } }),
            prisma.user.findUnique({ where: { id: senderId } }),
        ]);

        if (!vault) throw new Error('Cofre não encontrado.');
        if (vault.isPrivate) throw new Error('Este cofre é privado e não permite convites.');
        if (!sender) throw new Error('Usuário remetente não encontrado.');
        
        let receiver = await prisma.user.findUnique({ where: { email: receiverEmail } });
        let receiverId: string | null = null;

        if (receiver) {
            receiverId = receiver.id;
            
            // Verificar se o usuário já é membro
            const isAlreadyMember = await this.isMember(vaultId, receiverId);
            if (isAlreadyMember) {
                throw new Error('Este usuário já é membro deste cofre.');
            }

            // Verificar se já existe um convite pendente para este usuário e cofre
            const existingInvitation = await prisma.invitation.findFirst({
                where: { targetId: vaultId, receiverId, status: 'pending', type: 'vault' }
            });
            if (existingInvitation) {
                throw new Error('Este usuário já tem um convite pendente para este cofre.');
            }
        } else {
            // Verificar se já existe um convite pendente para este email
            const existingInvitation = await prisma.invitation.findFirst({
                where: { targetId: vaultId, receiverEmail, status: 'pending', type: 'vault' }
            });
            if (existingInvitation) {
                throw new Error('Este e-mail já tem um convite pendente para este cofre.');
            }
        }

        const invitation = await prisma.invitation.create({
            data: {
                type: 'vault',
                targetId: vaultId,
                targetName: vault.name,
                senderId: senderId,
                receiverId: receiverId, // Pode ser null
                receiverEmail: receiverEmail,
                status: 'pending',
            }
        });

        // Se o usuário existe, criar notificação
        if (receiverId) {
            const { NotificationService } = await import('./notification.service');
            await NotificationService.createVaultInviteNotification({
                receiverId: receiverId,
                senderName: sender.name,
                vaultName: vault.name,
                invitationId: invitation.id,
            });
        }
        
        // Enviar e-mail de convite
        try {
            const { sendEmail } = await import('@/lib/sendgrid');
            const { inviteEmail } = await import('@/app/_templates/emails/invite-template');
            
            // Criar link de convite - se usuário não existir, direciona para registro
            const inviteLink = receiver 
                ? `${process.env.NEXTAUTH_URL}/invitations` 
                : `${process.env.NEXTAUTH_URL}/register?invite=${invitation.id}`;
            
            // Adicionar contexto ao subject se fornecido
            const subject = context 
                ? `Convite para o cofre "${vault.name}" através da caixinha "${context.goalName}"`
                : `Convite para participar do cofre "${vault.name}"`;
            
            await sendEmail({
                to: receiverEmail,
                subject,
                html: inviteEmail(sender.name, vault.name, inviteLink, context?.goalName)
            });
            
            console.log(`Email de convite enviado para ${receiverEmail}`);
        } catch (emailError) {
            console.error('Erro ao enviar email de convite:', emailError);
            // Não falha a operação se email não for enviado
        }

    } catch (error) {
        console.error('Erro ao criar convite:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Não foi possível criar o convite.');
    }
  }

  /**
   * Associa convites pendentes por email ao usuário após registro
   */
  static async linkInvitationsByEmail(userEmail: string, userId: string): Promise<void> {
    try {
      await prisma.invitation.updateMany({
        where: {
          receiverEmail: userEmail,
          receiverId: null,
          status: 'pending',
          type: 'vault',
        },
        data: {
          receiverId: userId,
        },
      });
      
      console.log(`✅ Convites vinculados para ${userEmail} (userId: ${userId})`);
    } catch (error) {
      console.error('Erro ao vincular convites por email:', error);
    }
  }


  /**
   * Busca convites pendentes para um usuário
   * @param userId - ID do usuário
   * @returns Lista de convites
   */
  static async getPendingInvitations(userId: string): Promise<VaultInvitationData[]> {
    try {
      // Primeiro buscar o usuário para ter seu email
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      });

      if (!user) {
        console.log(`❌ Usuário ${userId} não encontrado`);
        return [];
      }

      const invitations = await prisma.invitation.findMany({
        where: {
          OR: [
            {
              receiverId: userId,
              type: 'vault',
              status: 'pending',
            },
            {
              receiverEmail: user.email,
              type: 'vault', 
              status: 'pending',
            }
          ]
        },
        include: {
          sender: {
            select: {
              name: true,
              avatarUrl: true,
            },
          },
          vault: {
            select: {
              name: true,
              imageUrl: true,
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      avatarUrl: true,
                    },
                  },
                },
                take: 5, // Limitar para não sobrecarregar
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      console.log(`📧 Buscando convites para userId: ${userId}`);
      console.log(`📧 Encontrados ${invitations.length} convites pendentes`);
      
      // Mapear os dados para incluir o targetName do cofre
      return invitations.map(inv => ({
        ...inv,
        targetName: inv.vault?.name || 'Cofre sem nome'
      }));
    } catch (error) {
      console.error('Erro ao buscar convites:', error);
      return [];
    }
  }

  /**
   * Busca todos os convites de um usuário (pendentes, aceitos, recusados)
   * @param userId - ID do usuário
   * @returns Lista de convites
   */
  static async getUserInvitations(userId: string): Promise<VaultInvitationData[]> {
    try {
      const invitations = await prisma.invitation.findMany({
        where: {
          receiverId: userId,
          type: 'vault',
        },
        include: {
          sender: {
            select: {
              name: true,
            },
          },
          vault: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Mapear os dados para incluir o targetName do cofre
      return invitations.map(inv => ({
        ...inv,
        targetName: inv.vault?.name || 'Cofre sem nome'
      }));
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
      // Usar transação para garantir atomicidade
      await prisma.$transaction(async (tx) => {
        const invitation = await tx.invitation.findUnique({
          where: { id: invitationId },
        });

        if (!invitation || invitation.receiverId !== userId || invitation.status !== 'pending') {
          throw new Error('Convite não encontrado, inválido ou já processado.');
        }

        // Adicionar como membro do cofre
        await tx.vaultMember.create({
          data: {
            vaultId: invitation.targetId,
            userId,
            role: 'member',
          },
        });

        // Atualizar status do convite
        await tx.invitation.update({
          where: { id: invitationId },
          data: { status: 'accepted' },
        });
      });

      // Marcar notificação como lida
      const { NotificationService } = await import('./notification.service');
      await NotificationService.markAsReadByRelatedId(invitationId, userId);

    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      throw new Error('Erro ao aceitar convite. Talvez você já seja membro deste cofre.');
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

      if (!invitation || invitation.receiverId !== userId || invitation.status !== 'pending') {
        throw new Error('Convite não encontrado ou inválido');
      }

      await prisma.invitation.update({
        where: { id: invitationId },
        data: { status: 'declined' },
      });

      // Marcar notificação como lida
      const { NotificationService } = await import('./notification.service');
      await NotificationService.markAsReadByRelatedId(invitationId, userId);

    } catch (error) {
      console.error('Erro ao recusar convite:', error);
      throw new Error('Erro ao recusar convite');
    }
  }

  /**
   * Deleta um convite (apenas para limpeza de histórico)
   * @param invitationId - ID do convite
   * @param userId - ID do usuário
   */
  static async deleteInvitation(invitationId: string, userId: string): Promise<void> {
    try {
      const invitation = await prisma.invitation.findUnique({
        where: { id: invitationId },
      });

      if (!invitation || invitation.receiverId !== userId) {
        throw new Error('Convite não encontrado ou sem permissão.');
      }

      await prisma.invitation.delete({
        where: { id: invitationId },
      });
    } catch (error) {
      console.error('Erro ao deletar convite:', error);
      throw new Error('Erro ao deletar convite');
    }
  }

  /**
   * Busca convites pendentes enviados para um cofre específico
   * @param vaultId - ID do cofre
   * @returns Lista de convites pendentes
   */
  static async getVaultPendingInvitations(vaultId: string): Promise<VaultInvitationData[]> {
    try {
      const invitations = await prisma.invitation.findMany({
        where: {
          targetId: vaultId,
          type: 'vault',
          status: 'pending',
        },
        include: {
          sender: {
            select: {
              name: true,
            },
          },
          vault: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Mapear os dados para incluir o targetName do cofre
      return invitations.map(inv => ({
        ...inv,
        targetName: inv.vault?.name || 'Cofre sem nome'
      }));
    } catch (error) {
      console.error('Erro ao buscar convites do cofre:', error);
      return [];
    }
  }

  /**
   * Cancela um convite pendente (ação do remetente ou dono do cofre)
   * @param invitationId - ID do convite
   * @param userId - ID do usuário que está cancelando (deve ser o remetente ou dono do cofre)
   */
  static async cancelInvitation(invitationId: string, userId: string): Promise<void> {
    try {
      const invitation = await prisma.invitation.findUnique({
        where: { id: invitationId },
        include: {
          vault: true,
        },
      });

      if (!invitation) {
        throw new Error('Convite não encontrado.');
      }

      // Verificar permissão: deve ser o remetente ou o dono do cofre
      const isSender = invitation.senderId === userId;
      const isOwner = invitation.vault?.ownerId === userId;

      if (!isSender && !isOwner) {
        throw new Error('Sem permissão para cancelar este convite.');
      }

      await prisma.invitation.delete({
        where: { id: invitationId },
      });
      
      // Se houver notificação associada, ela deve ser removida ou atualizada?
      // Ao deletar o convite, a notificação pode ficar "órfã" se não tiver cascade, 
      // mas como a notificação tem relatedId, podemos tentar limpar também.
      if (invitation.receiverId) {
         const { NotificationService } = await import('./notification.service');
         // Implementar limpeza de notificação se necessário, ou deixar como está (o link vai falhar ou avisar que expirou)
         // Por enquanto, vamos deixar, pois o usuário pode querer saber que foi convidado mas cancelaram.
         // Ou podemos deletar a notificação para não poluir. Vamos deletar por relatedId.
         await prisma.notification.deleteMany({
             where: { relatedId: invitationId }
         });
      }

    } catch (error) {
      console.error('Erro ao cancelar convite:', error);
      throw new Error('Erro ao cancelar convite');
    }
  }

  /**
   * Busca convites enviados pelo usuário (pendentes)
   * @param userId - ID do usuário
   * @returns Lista de convites enviados
   */
  static async getUserSentInvitations(userId: string): Promise<VaultInvitationData[]> {
    try {
      const invitations = await prisma.invitation.findMany({
        where: {
          senderId: userId,
          type: 'vault',
          status: 'pending',
        },
        include: {
          sender: {
            select: {
              name: true,
            },
          },
          receiver: {
            select: {
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          vault: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Mapear os dados para incluir o targetName do cofre
      return invitations.map(inv => ({
        ...inv,
        targetName: inv.vault?.name || 'Cofre sem nome'
      }));
    } catch (error) {
      console.error('Erro ao buscar convites enviados:', error);
      return [];
    }
  }
}
