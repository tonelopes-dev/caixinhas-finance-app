'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NotificationService } from '@/services/notification.service';
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
