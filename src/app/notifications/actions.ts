'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NotificationService } from '@/services/notification.service';
import { VaultService } from '@/services/vault.service';
import { revalidatePath } from 'next/cache';

/**
 * Busca notificações do usuário autenticado
 */
export async function getNotifications() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return [];
  }

  const notifications = await NotificationService.getUserNotifications(session.user.id);
  return notifications;
}

/**
 * Busca notificações não lidas
 */
export async function getUnreadNotifications() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return [];
  }

  const notifications = await NotificationService.getUnreadNotifications(session.user.id);
  return notifications;
}

/**
 * Busca contagem de notificações não lidas
 */
export async function getUnreadCount() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return 0;
  }

  const count = await NotificationService.getUnreadCount(session.user.id);
  return count;
}

/**
 * Marca notificação como lida
 */
export async function markNotificationAsRead(notificationId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error('Não autenticado');
  }

  await NotificationService.markAsRead(notificationId);
  revalidatePath('/notifications');
  revalidatePath('/dashboard');
}

/**
 * Marca todas as notificações como lidas
 */
export async function markAllNotificationsAsRead() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error('Não autenticado');
  }

  await NotificationService.markAllAsRead(session.user.id);
  revalidatePath('/notifications');
  revalidatePath('/dashboard');
}

/**
 * Deleta uma notificação
 */
export async function deleteNotification(notificationId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error('Não autenticado');
  }

  await NotificationService.deleteNotification(notificationId);
  revalidatePath('/notifications');
  revalidatePath('/dashboard');
}

/**
 * Busca convites do usuário
 */
export async function getUserInvitations() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return [];
  }

  const invitations = await VaultService.getUserInvitations(session.user.id);
  return invitations;
}

/**
 * Deleta um convite
 */
export async function deleteInvitation(invitationId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error('Não autenticado');
  }

  await VaultService.deleteInvitation(invitationId, session.user.id);
  revalidatePath('/notifications');
}

/**
 * Busca convites enviados pelo usuário
 */
export async function getUserSentInvitations() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return [];
  }

  const invitations = await VaultService.getUserSentInvitations(session.user.id);
  return invitations;
}

/**
 * Cancela um convite enviado
 */
export async function cancelInvitation(invitationId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error('Não autenticado');
  }

  await VaultService.cancelInvitation(invitationId, session.user.id);
  revalidatePath('/notifications');
}
