'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell, CircleDot, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import type { NotificationData } from '@/services/notification.service';
import { markNotificationAsRead } from '@/app/notifications/actions';
import { useLoading } from '@/components/providers/loading-provider';

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
  const router = useRouter();
  const { showLoading, hideLoading } = useLoading();
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

  const handleViewAll = (e: React.MouseEvent) => {
    e.preventDefault();
    showLoading('Carregando notificações...', false);
    
    setTimeout(() => {
      router.push('/notifications');
    }, 300);
  };

  const recentUnreadNotifications = notifications.filter(n => !n.isRead).slice(0, 4);
  const { isLoading } = useLoading();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "relative transition-all duration-200 hover:scale-105",
            unreadCount > 0 && "animate-pulse"
          )}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground shadow-lg ring-2 ring-background animate-in zoom-in-50">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notificações {unreadCount > 0 ? `(${unreadCount} não lidas)` : ''}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-screen max-w-md" align="end" sideOffset={8}>
        <DropdownMenuLabel className="flex justify-between items-center py-3 px-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notificações</span>
            {unreadCount > 0 && (
              <span className="text-xs text-muted-foreground">
                ({unreadCount} {unreadCount === 1 ? 'nova' : 'novas'})
              </span>
            )}
          </div>
          <button
            onClick={handleViewAll}
            disabled={isLoading}
            className="text-xs font-normal text-primary hover:underline flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            Ver todas
          </button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {recentUnreadNotifications.length > 0 ? (
          <>
            {recentUnreadNotifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                asChild
                className="focus:bg-accent/50"
              >
                <Link 
                  href={notification.link || '/notifications'} 
                  className={cn(
                    "flex items-start gap-3 p-3 cursor-pointer transition-colors",
                    "hover:bg-accent/50 border-l-2 border-transparent hover:border-primary"
                  )}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <Avatar className="h-9 w-9 mt-0.5 border-2 border-primary/30 bg-primary/5">
                    {getNotificationIcon(notification.type)}
                    <AvatarFallback>
                      <Bell className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {new Date(notification.createdAt).toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <CircleDot className="h-3 w-3 text-primary mt-1 flex-shrink-0 animate-pulse" />
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <div className="p-2 text-center">
              <button
                onClick={handleViewAll}
                disabled={isLoading}
                className="w-full text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1 py-2 disabled:opacity-50"
              >
                <CheckCheck className="h-3 w-3" />
                Ver todas as notificações
              </button>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="mb-3 mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Nenhuma notificação nova.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Você está em dia! 🎉
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
