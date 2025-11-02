'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Bell, Check, CircleDot, ClipboardCheck, Trash2 } from 'lucide-react';
import { notifications as allNotifications, invitations } from '@/lib/data';
import { useState } from 'react';
import type { Notification } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DeclineInvitationDialog } from '@/components/invitations/decline-invitation-dialog';
import { DeleteNotificationDialog } from '@/components/notifications/delete-notification-dialog';


const getNotificationIcon = (type: Notification['type']) => {
    const notification = allNotifications.find(n => n.type === type);
    switch (type) {
        case 'goal_invite':
        case 'vault_invite':
            return <AvatarImage src={notification?.actor?.avatarUrl} />;
        case 'transaction_added':
            return <span className="font-bold text-primary text-sm">R$</span>;
        case 'goal_progress':
             return <span className="font-bold text-green-500 text-sm">%</span>;
        default:
            return <Bell className="h-5 w-5" />;
    }
}


export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>(allNotifications);
    const [filter, setFilter] = useState('all');

    const toggleRead = (id: string) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: !n.read } : n));
    };
    
    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({...n, read: true})));
    }
    
    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter(n => n.id !== id));
    }

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'read') return n.read;
        if (filter === 'unread') return !n.read;
        return true;
    });

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-3xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Painel
          </Link>
        </Button>
        <Card>
          <CardHeader className='flex-row items-center justify-between'>
            <div>
                <CardTitle className="flex items-center gap-2 font-headline">
                <Bell className="h-6 w-6 text-primary" />
                Todas as Notificações
                </CardTitle>
                <CardDescription>
                Gerencie todos os seus alertas, convites e atualizações.
                </CardDescription>
            </div>
             <div className='flex items-center gap-2'>
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
                <Button variant="outline" size="sm" onClick={markAllAsRead}>Marcar todas como lidas</Button>
             </div>

          </CardHeader>
          <CardContent className="grid gap-4">
            {filteredNotifications.map(notification => {
              const isInvite = notification.type === 'goal_invite' || notification.type === 'vault_invite';
              const inviteData = isInvite ? invitations.find(inv => inv.id === notification.relatedId) : null;

              return (
                <div key={notification.id} className={cn("flex items-center justify-between rounded-lg border p-4 transition-colors", notification.read ? 'bg-muted/50 text-muted-foreground' : 'bg-card')}>
                  <div className="flex items-center gap-4 flex-1">
                      <Avatar className={cn("h-10 w-10 border-2", notification.read ? 'border-muted' : 'border-primary/50')}>
                          {getNotificationIcon(notification.type)}
                          <AvatarFallback><Bell /></AvatarFallback>
                      </Avatar>
                      <div className='flex-1'>
                          <p className={cn("font-medium", notification.read && "font-normal")} dangerouslySetInnerHTML={{ __html: notification.text }} />
                          <p className="text-xs">{new Date(notification.timestamp).toLocaleString('pt-BR')}</p>
                      </div>
                  </div>
                  <div className="flex gap-1">
                    {isInvite && inviteData ? (
                        <>
                            <Button variant="outline" size="icon" className='h-8 w-8'>
                                <Check className="h-4 w-4" />
                                <span className="sr-only">Aceitar</span>
                            </Button>
                            <DeclineInvitationDialog invitation={inviteData} />
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" size="icon" onClick={() => toggleRead(notification.id)} title={notification.read ? 'Marcar como não lida' : 'Marcar como lida'}>
                                {notification.read ? <ClipboardCheck className="h-5 w-5" /> : <CircleDot className="h-5 w-5 text-primary" />}
                                <span className="sr-only">{notification.read ? 'Marcar como não lida' : 'Marcar como lida'}</span>
                            </Button>
                            <DeleteNotificationDialog
                                notificationId={notification.id}
                                notificationText={notification.text}
                                onDelete={deleteNotification}
                            />
                        </>
                    )}
                  </div>
                </div>
              )
            })}
            {filteredNotifications.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                    {filter === 'unread' ? 'Nenhuma notificação nova.' : 'Nenhuma notificação encontrada.'}
                </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
