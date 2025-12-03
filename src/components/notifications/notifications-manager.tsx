'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, CircleDot, ClipboardCheck, Trash2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '@/app/notifications/actions';
import { useToast } from '@/hooks/use-toast';
import type { NotificationData } from '@/services/notification.service';

type NotificationsManagerProps = {
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
      return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
};

export function NotificationsManager({ initialNotifications }: NotificationsManagerProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>(initialNotifications);
  const [filter, setFilter] = useState('all');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const toggleRead = async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;

    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: !n.isRead } : n
    ));

    startTransition(async () => {
      try {
        await markNotificationAsRead(id);
      } catch (error) {
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
    const unreadNotifications = notifications.filter(n => !n.isRead);
    
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));

    startTransition(async () => {
      try {
        await markAllNotificationsAsRead();
        toast({
          title: 'Sucesso',
          description: `${unreadNotifications.length} notificações marcadas como lidas`,
        });
      } catch (error) {
        setNotifications(initialNotifications);
        toast({
          title: 'Erro',
          description: 'Não foi possível marcar notificações como lidas',
          variant: 'destructive',
        });
      }
    });
  };

  const handleDeleteNotification = async (id: string) => {
    const originalNotifications = [...notifications];
    setNotifications(notifications.filter(n => n.id !== id));

    startTransition(async () => {
      try {
        await deleteNotification(id);
        toast({
          title: 'Notificação excluída',
          description: 'A notificação foi removida com sucesso',
        });
      } catch (error) {
        setNotifications(originalNotifications);
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir a notificação',
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Cabeçalho com ações */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Suas Notificações
            {unreadCount > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Acompanhe atualizações sobre seus cofres e metas
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/invite">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Gerenciar Convites
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros e ações */}
      <div className='flex items-center justify-between gap-2'>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Filtrar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas ({notifications.length})</SelectItem>
            <SelectItem value="unread">Não Lidas ({unreadCount})</SelectItem>
            <SelectItem value="read">Lidas ({notifications.length - unreadCount})</SelectItem>
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleMarkAllAsRead}
          disabled={isPending || notifications.every(n => n.isRead)}
        >
          <ClipboardCheck className="h-4 w-4 mr-2" />
          Marcar todas como lidas
        </Button>
      </div>

      {/* Lista de notificações */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <CardTitle className="text-lg text-muted-foreground mb-2">
                {filter === 'all' ? 'Nenhuma notificação' : `Nenhuma notificação ${filter === 'read' ? 'lida' : 'não lida'}`}
              </CardTitle>
              <CardDescription>
                {filter === 'all' 
                  ? 'Você está em dia! Suas notificações aparecerão aqui.'
                  : 'Ajuste o filtro para ver outras notificações.'
                }
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map(notification => {
            const isInvite = notification.type === 'vault_invite';

            return (
              <div 
                key={notification.id} 
                className={cn(
                  "flex items-center justify-between rounded-lg border p-4 transition-all hover:shadow-sm",
                  notification.isRead ? 'bg-muted/30 text-muted-foreground' : 'bg-card border-primary/20 shadow-sm'
                )}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className={cn(
                          "font-medium text-sm",
                          notification.isRead ? "text-muted-foreground" : "text-foreground"
                        )}>
                          {notification.message}
                        </h3>
                        <p className={cn(
                          "text-sm mt-1",
                          notification.isRead ? "text-muted-foreground/70" : "text-muted-foreground"
                        )}>
                          {new Date(notification.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                        
                        {isInvite && (
                          <Link 
                            href="/invite"
                            className="inline-flex items-center text-sm text-primary hover:text-primary/80 mt-2"
                          >
                            Ver convites →
                          </Link>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(notification.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRead(notification.id)}
                          disabled={isPending}
                          className="h-8 w-8 p-0"
                        >
                          {notification.isRead ? (
                            <CircleDot className="h-4 w-4" />
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              disabled={isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir notificação</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. A notificação será removida permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteNotification(notification.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}