'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, CircleDot, ClipboardCheck, Trash2, Mail, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, deleteInvitation, cancelInvitation } from '@/app/notifications/actions';
import { useToast } from '@/hooks/use-toast';
import type { NotificationData } from '@/services/notification.service';
import type { VaultInvitationData } from '@/services/vault.service';

type NotificationsManagerProps = {
  initialNotifications: NotificationData[];
  initialInvitations: VaultInvitationData[];
  initialSentInvitations?: VaultInvitationData[];
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

const getInvitationStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200 hover:bg-yellow-500/20"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
    case 'accepted':
      return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Aceito</Badge>;
    case 'declined':
      return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/20"><XCircle className="w-3 h-3 mr-1" /> Recusado</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function NotificationsManager({ initialNotifications, initialInvitations, initialSentInvitations = [] }: NotificationsManagerProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>(initialNotifications);
  const [invitations, setInvitations] = useState<VaultInvitationData[]>(initialInvitations);
  const [sentInvitations, setSentInvitations] = useState<VaultInvitationData[]>(initialSentInvitations);
  const [filter, setFilter] = useState('all');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // --- Notification Handlers ---

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
        setNotifications(previousNotifications);
        toast({
          title: 'Erro',
          description: 'Não foi possível marcar todas como lidas',
          variant: 'destructive',
        });
      }
    });
  };

  const handleDeleteNotification = async (id: string) => {
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
        setNotifications(previousNotifications);
        toast({
          title: 'Erro',
          description: 'Não foi possível deletar a notificação',
          variant: 'destructive',
        });
      }
    });
  };

  // --- Invitation Handlers ---

  const handleDeleteInvitation = async (id: string) => {
    const previousInvitations = invitations;
    setInvitations(invitations.filter(i => i.id !== id));

    startTransition(async () => {
      try {
        await deleteInvitation(id);
        toast({
          title: 'Sucesso',
          description: 'Convite removido do histórico',
        });
      } catch (error) {
        setInvitations(previousInvitations);
        toast({
          title: 'Erro',
          description: 'Não foi possível remover o convite',
          variant: 'destructive',
        });
      }
    });
  };

  const handleCancelSentInvitation = async (id: string) => {
    const previousSentInvitations = sentInvitations;
    setSentInvitations(sentInvitations.filter(i => i.id !== id));

    startTransition(async () => {
      try {
        await cancelInvitation(id);
        toast({
          title: 'Sucesso',
          description: 'Convite cancelado com sucesso',
        });
      } catch (error) {
        setSentInvitations(previousSentInvitations);
        toast({
          title: 'Erro',
          description: 'Não foi possível cancelar o convite',
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
    <Tabs defaultValue="notifications" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notificações
          {notifications.some(n => !n.isRead) && (
            <span className="ml-1 flex h-2 w-2 rounded-full bg-destructive" />
          )}
        </TabsTrigger>
        <TabsTrigger value="invitations" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Convites
          {invitations.some(i => i.status === 'pending') && (
            <span className="ml-1 flex h-2 w-2 rounded-full bg-yellow-500" />
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="notifications" className="space-y-4">
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
            disabled={isPending || notifications.every(n => n.isRead)}
          >
            Marcar todas como lidas
          </Button>
        </div>

        <div className="grid gap-3">
          {filteredNotifications.map(notification => {
            const isInvite = notification.type === 'vault_invite';

            return (
              <div 
                key={notification.id} 
                className={cn(
                  "flex items-center justify-between rounded-lg border p-4 transition-all hover:shadow-sm",
                  notification.isRead ? 'bg-muted/30 text-muted-foreground' : 'bg-card border-primary/20 shadow-sm'
                )}
              >
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className={cn("h-10 w-10 border-2", notification.isRead ? 'border-muted' : 'border-primary/50')}>
                    {getNotificationIcon(notification.type)}
                    <AvatarFallback><Bell /></AvatarFallback>
                  </Avatar>
                  <div className='flex-1'>
                    <p className={cn("font-medium mb-1 text-sm md:text-base", notification.isRead && "font-normal")}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {isInvite && notification.link ? (
                    <Button variant="outline" size="sm" asChild className="hidden md:flex" onClick={() => toggleRead(notification.id)}>
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
                    className="h-8 w-8"
                  >
                    {notification.isRead ? (
                      <ClipboardCheck className="h-4 w-4" />
                    ) : (
                      <CircleDot className="h-4 w-4 text-primary" />
                    )}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deletar notificação?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteNotification(notification.id)}
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
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
              <Bell className="h-12 w-12 mb-4 opacity-20" />
              <p>
                {filter === 'unread' ? 'Você leu todas as notificações!' : 'Nenhuma notificação encontrada.'}
              </p>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="invitations" className="space-y-6">
        {/* Convites Recebidos */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recebidos</h3>
          <div className="grid gap-3">
            {invitations.map(invitation => (
              <div 
                key={invitation.id} 
                className="flex flex-col md:flex-row md:items-center justify-between rounded-lg border bg-card p-4 gap-4 transition-all hover:shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10 border-2 border-blue-100">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <AvatarFallback>CV</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm md:text-base">
                        Convite para o cofre "{invitation.targetName}"
                      </span>
                      {getInvitationStatusBadge(invitation.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enviado por <span className="font-medium text-foreground">{invitation.sender.name}</span> em {new Date(invitation.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 self-end md:self-center">
                  {invitation.status === 'pending' && (
                    <Button size="sm" asChild>
                      <Link href="/vaults">Responder</Link>
                    </Button>
                  )}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        disabled={isPending}
                        title="Remover do histórico"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover convite do histórico?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Isso removerá apenas o registro visual deste convite. A ação original (aceitar/recusar) não será desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteInvitation(invitation.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
            
            {invitations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                <Mail className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">Nenhum convite recebido.</p>
              </div>
            )}
          </div>
        </div>

        {/* Convites Enviados */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Enviados (Pendentes)</h3>
          <div className="grid gap-3">
            {sentInvitations.map(invitation => (
              <div 
                key={invitation.id} 
                className="flex flex-col md:flex-row md:items-center justify-between rounded-lg border bg-card p-4 gap-4 transition-all hover:shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10 border-2 border-muted">
                    {invitation.receiver?.avatarUrl ? (
                      <img src={invitation.receiver.avatarUrl} alt={invitation.receiver.name} className="h-full w-full object-cover" />
                    ) : (
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    )}
                    <AvatarFallback>{invitation.receiver?.name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm md:text-base">
                        Convite para <span className="text-foreground font-semibold">{invitation.receiver?.name || invitation.receiverEmail || 'Usuário'}</span> entrar em "{invitation.targetName}"
                      </span>
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">
                        Pendente
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {invitation.receiverEmail && (
                        <span className="block text-xs mb-1">Email: {invitation.receiverEmail}</span>
                      )}
                      Enviado em {new Date(invitation.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 self-end md:self-center">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                        disabled={isPending}
                      >
                        Cancelar Envio
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancelar convite?</AlertDialogTitle>
                        <AlertDialogDescription>
                          O convite será invalidado e o usuário não poderá mais aceitá-lo.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Voltar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleCancelSentInvitation(invitation.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Cancelar Convite
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
            
            {sentInvitations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                <Mail className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">Nenhum convite enviado pendente.</p>
              </div>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
