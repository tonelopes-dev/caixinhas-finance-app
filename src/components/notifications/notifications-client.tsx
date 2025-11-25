'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, CircleDot, ClipboardCheck, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '@/app/notifications/actions';
import { useToast } from '@/hooks/use-toast';
import type { NotificationData } from '@/services/notification.service';

type NotificationsClientProps = {
  initialNotifications: NotificationData[];
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'vault_invite':
      return <Bell className="h-5 w-5 text-blue-500" />;
    case 'transaction_added':
      return <span className="font-bold text-primary text-sm">R$</span>;
    case 'goal_progress':
      return <span className="font-bold text-green-500 text-sm">%</span>;
    case 'vault_member_added':
      return <Bell className="h-5 w-5 text-green-500" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
};

export function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>(initialNotifications);
  const [filter, setFilter] = useState('all');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const toggleRead = async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;

    // Atualiza UI otimisticamente
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: !n.isRead } : n
    ));

    // Chama action
    startTransition(async () => {
      try {
        await markNotificationAsRead(id);
      } catch (error) {
        // Reverte em caso de erro
        setNotifications(notifications.map(n => 
          n.id === id ? { ...n, isRead: notification.isRead } : n
        ));
        toast({
          title: 'Erro',
          description: 'Não foi possível atualizar a notificação',
          variant: 'destructive',
        });
      }
    });
  };

  const handleMarkAllAsRead = async () => {
    // Atualiza UI otimisticamente
    const previousNotifications = notifications;
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));

    startTransition(async () => {
      try {
        await markAllNotificationsAsRead();
        toast({
          title: 'Sucesso',
          description: 'Todas as notificações foram marcadas como lidas',
        });
      } catch (error) {
        // Reverte em caso de erro
        setNotifications(previousNotifications);
        toast({
          title: 'Erro',
          description: 'Não foi possível marcar todas como lidas',
          variant: 'destructive',
        });
      }
    });
  };

  const handleDelete = async (id: string) => {
    // Remove da UI otimisticamente
    const previousNotifications = notifications;
    setNotifications(notifications.filter(n => n.id !== id));

    startTransition(async () => {
      try {
        await deleteNotification(id);
        toast({
          title: 'Sucesso',
          description: 'Notificação deletada',
        });
      } catch (error) {
        // Reverte em caso de erro
        setNotifications(previousNotifications);
        toast({
          title: 'Erro',
          description: 'Não foi possível deletar a notificação',
          variant: 'destructive',
        });
      }
    });
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'read') return n.isRead;
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  return (
    <>
      <div className='flex items-center justify-between gap-2 mb-4'>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full md:w-[120px]">
            <SelectValue placeholder="Filtrar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="unread">Não Lidas</SelectItem>
            <SelectItem value="read">Lidas</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleMarkAllAsRead}
          disabled={isPending}
        >
          Marcar todas como lidas
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredNotifications.map(notification => {
          const isInvite = notification.type === 'vault_invite';

          return (
            <div 
              key={notification.id} 
              className={cn(
                "flex items-center justify-between rounded-lg border p-4 transition-colors",
                notification.isRead ? 'bg-muted/50 text-muted-foreground' : 'bg-card'
              )}
            >
              <div className="flex items-center gap-4 flex-1">
                <Avatar className={cn("h-10 w-10 border-2", notification.isRead ? 'border-muted' : 'border-primary/50')}>
                  {getNotificationIcon(notification.type)}
                  <AvatarFallback><Bell /></AvatarFallback>
                </Avatar>
                <div className='flex-1'>
                  <p className={cn("font-medium mb-1", notification.isRead && "font-normal")}>
                    {notification.message}
                  </p>
                  <p className="text-xs">
                    {new Date(notification.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                {isInvite && notification.link ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={notification.link}>
                      Ver Convite
                    </Link>
                  </Button>
                ) : null}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => toggleRead(notification.id)} 
                  title={notification.isRead ? 'Marcar como não lida' : 'Marcar como lida'}
                  disabled={isPending}
                >
                  {notification.isRead ? (
                    <ClipboardCheck className="h-5 w-5" />
                  ) : (
                    <CircleDot className="h-5 w-5 text-primary" />
                  )}
                  <span className="sr-only">
                    {notification.isRead ? 'Marcar como não lida' : 'Marcar como lida'}
                  </span>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive"
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Deletar</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Deletar notificação?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. A notificação será permanentemente removida.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(notification.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Deletar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );
        })}
        {filteredNotifications.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            {filter === 'unread' ? 'Nenhuma notificação nova.' : 'Nenhuma notificação encontrada.'}
          </p>
        )}
      </div>
    </>
  );
}
