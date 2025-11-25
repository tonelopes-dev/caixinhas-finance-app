/**
 * NotificationService - Serviço de gerenciamento de notificações
 * 
 * Responsável por criar, buscar e gerenciar notificações do sistema
 * Integrado com convites e outras ações do usuário
 */

import { prisma } from './prisma';

export type NotificationType = 
  | 'vault_invite'
  | 'goal_invite'
  | 'transaction_added'
  | 'goal_progress'
  | 'vault_member_added'
  | 'system';

export type NotificationData = {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  link?: string | null;
  createdAt: Date;
};

export class NotificationService {
  /**
   * Cria uma nova notificação
   */
  static async createNotification(data: {
    userId: string;
    type: NotificationType;
    message: string;
    link?: string;
  }): Promise<NotificationData> {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          message: data.message,
          link: data.link,
          isRead: false,
        },
      });

      return notification as NotificationData;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw new Error('Erro ao criar notificação');
    }
  }

  /**
   * Busca todas as notificações de um usuário
   */
  static async getUserNotifications(userId: string): Promise<NotificationData[]> {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return notifications as NotificationData[];
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }
  }

  /**
   * Busca notificações não lidas de um usuário
   */
  static async getUnreadNotifications(userId: string): Promise<NotificationData[]> {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId,
          isRead: false,
        },
        orderBy: { createdAt: 'desc' },
      });

      return notifications as NotificationData[];
    } catch (error) {
      console.error('Erro ao buscar notificações não lidas:', error);
      return [];
    }
  }

  /**
   * Conta notificações não lidas
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });

      return count;
    } catch (error) {
      console.error('Erro ao contar notificações não lidas:', error);
      return 0;
    }
  }

  /**
   * Marca uma notificação como lida
   */
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw new Error('Erro ao marcar notificação como lida');
    }
  }

  /**
   * Marca todas as notificações de um usuário como lidas
   */
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: { isRead: true },
      });
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      throw new Error('Erro ao marcar todas as notificações como lidas');
    }
  }

  /**
   * Deleta uma notificação
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      await prisma.notification.delete({
        where: { id: notificationId },
      });
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      throw new Error('Erro ao deletar notificação');
    }
  }

  /**
   * Cria notificação de convite para cofre
   */
  static async createVaultInviteNotification(data: {
    receiverId: string;
    senderName: string;
    vaultName: string;
    invitationId: string;
  }): Promise<NotificationData> {
    return this.createNotification({
      userId: data.receiverId,
      type: 'vault_invite',
      message: `${data.senderName} convidou você para participar do cofre "${data.vaultName}"`,
      link: `/vaults`,
    });
  }

  /**
   * Cria notificação de membro adicionado ao cofre
   */
  static async createMemberAddedNotification(data: {
    userId: string;
    vaultName: string;
    addedByName: string;
  }): Promise<NotificationData> {
    return this.createNotification({
      userId: data.userId,
      type: 'vault_member_added',
      message: `${data.addedByName} adicionou você ao cofre "${data.vaultName}"`,
      link: `/vaults`,
    });
  }
}
