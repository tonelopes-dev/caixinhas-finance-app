'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell, CircleDot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import type { NotificationData } from '@/services/notification.service';
import { markNotificationAsRead } from '@/app/notifications/actions';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'vault_invite':
      return <Bell className="h-4 w-4 text-blue-500" />;
    case 'transaction_added':
      return <span className="font-bold text-primary">R$</span>;
    case 'goal_progress':
      return <span className="font-bold text-green-500">%</span>;
    case 'vault_member_added':
      return <Bell className="h-4 w-4 text-green-500" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

type NotificationsDropdownProps = {
  initialNotifications?: NotificationData[];
  initialUnreadCount?: number;
};

export function NotificationsDropdown({ 
  initialNotifications = [],
  initialUnreadCount = 0,
}: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  useEffect(() => {
    setNotifications(initialNotifications);
    setUnreadCount(initialUnreadCount);
  }, [initialNotifications, initialUnreadCount]);

  const handleNotificationClick = async (id: string) => {
    // Otimisticamente marca como lida na UI local
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    try {
      await markNotificationAsRead(id);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida', error);
    }
  };

  const recentUnreadNotifications = notifications.filter(n => !n.isRead).slice(0, 4);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-screen max-w-md" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
          Notificações
          <Link href="/notifications" className='text-xs font-normal text-primary hover:underline'>Ver todas</Link>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {recentUnreadNotifications.length > 0 ? (
          recentUnreadNotifications.map((notification) => (
            <DropdownMenuItem key={notification.id} asChild>
              <Link 
                href={notification.link || '/notifications'} 
                className={cn("flex items-start gap-3 p-3", 'font-semibold')}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <Avatar className='h-8 w-8 mt-1 border-2 border-primary/50'>
                  {getNotificationIcon(notification.type)}
                  <AvatarFallback><Bell /></AvatarFallback>
                </Avatar>
                <div className="flex-1 whitespace-normal">
                  <p className="text-sm font-medium">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
                <CircleDot className="h-4 w-4 text-primary mt-1" />
              </Link>
            </DropdownMenuItem>
          ))
        ) : (
          <p className="p-4 text-center text-sm text-muted-foreground">
            Nenhuma notificação nova.
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
