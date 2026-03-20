'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Bell, CircleDot, CheckCheck, Users, Banknote, Target, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NotificationData } from '@/services/notification.service';
import { markNotificationAsRead } from '@/app/notifications/actions';
import { useLoading } from '@/components/providers/loading-provider';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'vault_invite':
      return <Users className="h-5 w-5 text-blue-500" />;
    case 'transaction_added':
      return <Banknote className="h-5 w-5 text-[#ff6b7b]" />;
    case 'goal_progress':
      return <Target className="h-5 w-5 text-green-500" />;
    case 'vault_member_added':
      return <UserPlus className="h-5 w-5 text-emerald-500" />;
    default:
      return <Bell className="h-5 w-5 text-[#2D241E]/40" />;
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
    showLoading('Carregando notificações...');
    
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
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff6b7b] text-[10px] font-bold text-white shadow-lg ring-2 ring-background animate-in zoom-in-50">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notificações {unreadCount > 0 ? `(${unreadCount} não lidas)` : ''}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-[380px] sm:w-[420px] bg-white/95 backdrop-blur-2xl border border-white/60 rounded-[32px] p-2 shadow-[0_25px_80px_rgba(45,36,30,0.15)] animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 overflow-hidden" 
        align="end" 
        sideOffset={12}
      >
        <DropdownMenuLabel className="flex justify-between items-center py-5 px-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ff6b7b]/10 text-[#ff6b7b]">
                <Bell className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
                <span className="font-headline text-xl font-bold text-[#2D241E] tracking-tight">Notificações</span>
                {unreadCount > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff6b7b]">
                    {unreadCount} {unreadCount === 1 ? 'nova' : 'novas'}
                </span>
                )}
            </div>
          </div>
          <button
            onClick={handleViewAll}
            disabled={isLoading}
            className="text-[11px] font-bold uppercase tracking-widest text-[#2D241E]/40 hover:text-[#ff6b7b] transition-all disabled:opacity-50"
          >
            Ver todas
          </button>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="mx-4 bg-[#2D241E]/5" />
        
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar pt-2">
            {recentUnreadNotifications.length > 0 ? (
            <div className="space-y-1 px-2 pb-2">
                {recentUnreadNotifications.map((notification) => (
                <DropdownMenuItem 
                    key={notification.id} 
                    asChild
                    className="rounded-2xl outline-none"
                >
                    <Link 
                    href={notification.link || '/notifications'} 
                    className={cn(
                        "flex items-start gap-4 p-4 cursor-pointer transition-all duration-300",
                        "hover:bg-[#f6f3f1] active:scale-[0.98] group"
                    )}
                    onClick={() => handleNotificationClick(notification.id)}
                    >
                    <div className="relative flex-shrink-0">
                        <div className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-[#2D241E]/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                            {getNotificationIcon(notification.type)}
                        </div>
                        <CircleDot className="absolute -top-1 -right-1 h-3 w-3 text-[#ff6b7b] fill-[#ff6b7b] ring-2 ring-white rounded-full animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                        <p className="text-sm font-bold text-[#2D241E] leading-relaxed group-hover:text-[#ff6b7b] transition-colors line-clamp-2">
                            {notification.message}
                        </p>
                        <p className="text-[10px] font-bold text-[#2D241E]/30 uppercase tracking-widest mt-2 flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-[#2D241E]/20" />
                            {new Date(notification.createdAt).toLocaleDateString('pt-BR', { 
                                day: '2-digit', 
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                    </Link>
                </DropdownMenuItem>
                ))}
                
                <div className="px-2 pt-2 pb-1">
                    <button
                        onClick={handleViewAll}
                        disabled={isLoading}
                        className="w-full h-12 rounded-2xl bg-[#f6f3f1] hover:bg-[#2D241E] hover:text-white text-[11px] font-bold uppercase tracking-widest text-[#2D241E]/60 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <CheckCheck className="h-4 w-4" />
                        Histórico Completo
                    </button>
                </div>
            </div>
            ) : (
            <div className="py-20 px-8 text-center flex flex-col items-center">
                <div className="relative mb-6">
                    <div className="absolute -inset-4 bg-gradient-to-tr from-[#ff6b7b]/20 to-[#fa8292]/5 rounded-full blur-xl opacity-50" />
                    <div className="relative h-20 w-20 rounded-[28px] bg-white shadow-xl border border-white flex items-center justify-center group-hover:rotate-6 transition-transform duration-500">
                        <Bell className="h-10 w-10 text-[#2D241E]/10" />
                    </div>
                </div>
                <h3 className="font-headline text-2xl font-bold text-[#2D241E] tracking-tight mb-2">
                    Tudo limpo!
                </h3>
                <p className="text-sm font-medium text-[#2D241E]/40 max-w-[200px] leading-relaxed italic">
                    Nenhuma notificação nova. Você está totalmente em dia! 🎉
                </p>
            </div>
            )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
