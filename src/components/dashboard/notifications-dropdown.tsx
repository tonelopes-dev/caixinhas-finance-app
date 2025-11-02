'use client';

import { useState } from 'react';
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
import { Bell, CircleDot, ClipboardCheck } from 'lucide-react';
import { notifications as mockNotifications } from '@/lib/data';
import type { Notification } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
        case 'goal_invite':
        case 'vault_invite':
            return <AvatarImage src={mockNotifications.find(n => n.type === type)?.actor?.avatarUrl} />;
        case 'transaction_added':
            return <span className="font-bold text-primary">R$</span>;
        case 'goal_progress':
             return <span className="font-bold text-green-500">%</span>;
        default:
            return <Bell className="h-4 w-4" />;
    }
}


export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the dropdown from closing
    e.preventDefault(); // Prevent link navigation if it's a link
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };
  
  const recentUnreadNotifications = notifications.filter(n => !n.read).slice(0, 4);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 md:w-96" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
            Notificações
            <Link href="/notifications" className='text-xs font-normal text-primary hover:underline'>Ver todas</Link>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {recentUnreadNotifications.length > 0 ? (
          recentUnreadNotifications.map((notification) => (
            <DropdownMenuItem key={notification.id} asChild>
                <Link href={notification.link || '#'} className={cn("flex items-start gap-3 p-3", !notification.read && 'font-semibold')}>
                    <Avatar className='h-8 w-8 mt-1 border-2 border-primary/50'>
                        {getNotificationIcon(notification.type)}
                        <AvatarFallback><Bell /></AvatarFallback>
                    </Avatar>
                    <div className="flex-1 whitespace-normal">
                        <p className="text-sm" dangerouslySetInnerHTML={{ __html: notification.text }} />
                        <p className="text-xs text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </p>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={(e) => toggleRead(notification.id, e)}
                        title={notification.read ? 'Marcar como não lida' : 'Marcar como lida'}
                    >
                        {notification.read ? <ClipboardCheck className="h-4 w-4" /> : <CircleDot className="h-4 w-4 text-primary" />}
                    </Button>
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
