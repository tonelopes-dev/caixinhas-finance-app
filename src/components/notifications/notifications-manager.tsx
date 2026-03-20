'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, CircleDot, ClipboardCheck, Trash2, Users, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '@/app/(private)/notifications/actions';
import { useToast } from '@/hooks/use-toast';
import type { NotificationData } from '@/services/notification.service';
import { motion, AnimatePresence } from 'framer-motion';

type NotificationsManagerProps = {
  initialNotifications: NotificationData[];
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'vault_invite':
      return (
        <div className="rounded-xl bg-blue-500/10 p-2 border border-blue-500/20">
          <Users className="h-5 w-5 text-blue-500" />
        </div>
      );
    case 'transaction_added':
      return (
        <div className="rounded-xl bg-[#ff6b7b]/10 p-2 border border-[#ff6b7b]/20">
          <span className="font-bold text-[#ff6b7b] text-sm leading-none">R$</span>
        </div>
      );
    case 'goal_progress':
      return (
        <div className="rounded-xl bg-emerald-500/10 p-2 border border-emerald-500/20">
          <span className="font-bold text-emerald-500 text-sm leading-none">%</span>
        </div>
      );
    case 'vault_member_added':
      return (
        <div className="rounded-xl bg-violet-500/10 p-2 border border-violet-500/20">
          <CheckCircle2 className="h-5 w-5 text-violet-500" />
        </div>
      );
    default:
      return (
        <div className="rounded-xl bg-[#2D241E]/5 p-2 border border-[#2D241E]/10">
          <Bell className="h-5 w-5 text-[#2D241E]/40" />
        </div>
      );
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
    <div className="space-y-10">
      {/* Filtros e Ações de Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-3xl bg-white/30 border border-white/50 backdrop-blur-sm shadow-sm">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40 mr-2">Filtrar por:</h2>
          <div className="flex items-center bg-white/40 p-1 rounded-2xl border border-white/60 shadow-inner w-full sm:w-auto">
            <button 
              onClick={() => setFilter('all')}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                filter === 'all' 
                  ? "bg-[#ff6b7b] text-white shadow-lg shadow-[#ff6b7b]/20" 
                  : "text-[#2D241E]/40 hover:text-[#2D241E]/60"
              )}
            >
              Todas
            </button>
            <button 
              onClick={() => setFilter('unread')}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                filter === 'unread' 
                  ? "bg-[#ff6b7b] text-white shadow-lg shadow-[#ff6b7b]/20" 
                  : "text-[#2D241E]/40 hover:text-[#2D241E]/60"
              )}
            >
              Não lidas
            </button>
            <button 
              onClick={() => setFilter('read')}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                filter === 'read' 
                  ? "bg-[#ff6b7b] text-white shadow-lg shadow-[#ff6b7b]/20" 
                  : "text-[#2D241E]/40 hover:text-[#2D241E]/60"
              )}
            >
              Lidas
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleMarkAllAsRead}
            disabled={isPending || notifications.every(n => n.isRead)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[8px] text-[#2D241E]/60 hover:text-[#ff6b7b] hover:bg-[#ff6b7b]/5 transition-all"
          >
            <ClipboardCheck className="h-4 w-4" />
            Lidas
          </Button>
          <Link href="/invite">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[8px] border-[#2D241E]/10 text-[#2D241E]/60 hover:border-[#ff6b7b]/20 hover:text-[#ff6b7b] transition-all"
            >
              <Users className="h-4 w-4" />
              Convites
            </Button>
          </Link>
        </div>
      </div>

      {/* Lista de notificações */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-20 bg-white/20 rounded-[32px] border border-dashed border-[#2D241E]/10"
            >
              <div className="rounded-full bg-white/40 p-6 mb-4 shadow-inner">
                <Bell className="h-10 w-10 text-[#2D241E]/20" />
              </div>
              <h3 className="font-headline text-xl font-bold text-[#2D241E]/40 italic">
                {filter === 'all' ? 'Tudo limpo por aqui!' : 'Nenhum item encontrado.'}
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/20 mt-2">
                Você está em dia com seus avisos.
              </p>
            </motion.div>
          ) : (
            filteredNotifications.map((notification, index) => (
              <motion.div 
                key={notification.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "relative group flex items-start gap-4 p-5 rounded-3xl border transition-all duration-300",
                  notification.isRead 
                    ? "bg-white/20 border-white/40 hover:bg-white/30" 
                    : "bg-white/50 border-[#ff6b7b]/20 shadow-lg shadow-[#ff6b7b]/5 hover:border-[#ff6b7b]/40"
                )}
              >
                {/* Status Dot */}
                {!notification.isRead && (
                  <div className="absolute top-6 left-1.5 w-1.5 h-1.5 rounded-full bg-[#ff6b7b] animate-pulse" />
                )}

                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0 pr-8">
                  <div className="flex flex-col">
                    <h3 className={cn(
                      "font-bold text-sm tracking-tight leading-snug",
                      notification.isRead ? "text-[#2D241E]/60" : "text-[#2D241E]"
                    )}>
                      {notification.message}
                    </h3>
                    
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/30">
                        {new Date(notification.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-[#2D241E]/10" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/30">
                        {new Date(notification.createdAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {notification.type === 'vault_invite' && (
                      <Link 
                        href="/invite"
                        className="inline-flex items-center gap-2 mt-4 text-[10px] font-black uppercase tracking-widest text-[#ff6b7b] hover:gap-3 transition-all"
                      >
                        Aceitar Convite →
                      </Link>
                    )}
                  </div>
                </div>

                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRead(notification.id)}
                    disabled={isPending}
                    className="h-10 w-10 p-0 rounded-xl hover:bg-white/60 transition-all"
                  >
                    {notification.isRead ? (
                      <CircleDot className="h-5 w-5 text-[#2D241E]/30" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-[#ff6b7b]" />
                    )}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        disabled={isPending}
                        className="h-10 w-10 p-0 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-[40px] border-none bg-[#fdfcf7] shadow-2xl p-8">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-headline text-2xl font-bold tracking-tight text-[#2D241E] italic">Excluir Aviso</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-medium text-[#2D241E]/60 italic mt-2">
                          Esta notificação será removida permanentemente. Deseja prosseguir?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="mt-8 gap-3 sm:flex-row flex-col">
                        <AlertDialogCancel className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] border-[#2D241E]/10 text-[#2D241E]/60 hover:bg-[#ff6b7b]/5 hover:text-[#ff6b7b] hover:border-[#ff6b7b]/20 transition-all">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-red-500 text-white shadow-xl shadow-red-500/20 border-none hover:bg-red-600 transition-all"
                        >
                          Confirmar Exclusão
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}