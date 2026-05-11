/**
 * Componente de Banner de Acesso Restrito
 * 
 * Exibe alertas e informações sobre o status de acesso do usuário
 * baseado no sistema de controle de acesso definido em access-control.ts
 */

'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Terminal, Clock, CheckCircle, AlertTriangle, Lock } from 'lucide-react';
import Link from 'next/link';
import { PremiumBadge } from '@/components/ui/premium-badge';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type AccessBannerProps = {
  status: 'active' | 'trial' | 'inactive';
  daysRemaining?: number;
  message?: string;
  showUpgradeButton?: boolean;
};

export function AccessBanner({
  status,
  daysRemaining = 0,
  message,
  showUpgradeButton = true,
}: AccessBannerProps) {
  // Para usuários ativos, mostra o PremiumBadge interativo
  if (status === 'active' && !message) {
    return (
      <div className="mb-6 max-w-xl">
        <PremiumBadge />
      </div>
    );
  }

  // Banner para trial ativo (aviso nos últimos 7 dias)
  if (status === 'trial' && daysRemaining > 0 && daysRemaining <= 7) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-6 md:p-8 rounded-[40px] bg-white/40 backdrop-blur-xl border border-amber-200/50 shadow-[0_20px_50px_rgba(45,36,30,0.06)] flex flex-col sm:flex-row items-center gap-6 overflow-hidden max-w-2xl"
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/5 blur-[60px] rounded-full" />
        
        <div className="relative z-10 flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-100 shadow-sm shrink-0">
          <Clock className="w-7 h-7 text-amber-600" />
        </div>
        
        <div className="relative z-10 flex-1 space-y-2 text-center sm:text-left">
          <h3 className="text-xl font-headline font-bold text-[#2D241E] italic tracking-tight">
            Período de Teste
          </h3>
          <p className="text-[#2D241E]/70 text-sm font-medium leading-relaxed">
            {message || `Seu período de teste expira em ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'}. Assine agora para manter acesso total!`}
          </p>
        </div>
        
        {showUpgradeButton && (
          <div className="relative z-10 shrink-0">
            <Button asChild className="rounded-2xl px-6 h-12 font-black uppercase tracking-widest text-[10px] bg-amber-500 hover:bg-amber-600 text-white border-none shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95">
              <Link href="/landing">Ver Planos</Link>
            </Button>
          </div>
        )}
      </motion.div>
    );
  }

  // Banner para trial expirado / acesso inativo
  if (status === 'inactive' || (status === 'trial' && daysRemaining <= 0)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-6 md:p-8 rounded-[40px] bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_20px_50px_rgba(45,36,30,0.06)] flex flex-col sm:flex-row items-center gap-6 overflow-hidden max-w-2xl"
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ff6b7b]/5 blur-[60px] rounded-full" />
        
        <div className="relative z-10 flex items-center justify-center h-14 w-14 rounded-2xl bg-[#ff6b7b]/10 shadow-sm shrink-0">
          <Lock className="w-7 h-7 text-[#ff6b7b]" />
        </div>
        
        <div className="relative z-10 flex-1 space-y-2 text-center sm:text-left">
          <h3 className="text-xl font-headline font-bold text-[#2D241E] italic tracking-tight">
            Acesso Restrito
          </h3>
          <div className="space-y-3">
            <p className="text-[#2D241E]/70 text-sm font-medium leading-relaxed">
              {message || 'Seu período de teste terminou. Para continuar usando seu espaço pessoal e criar novos cofres, por favor, assine um de nossos planos.'}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 rounded-full border border-white/80 shadow-sm">
                <span className="text-[9px] font-black text-[#2D241E]/40 uppercase tracking-[0.15em]">
                  ℹ️ Colaboração em cofres de outros continua disponível
                </span>
            </div>
          </div>
        </div>
        
        {showUpgradeButton && (
          <div className="relative z-10 shrink-0">
            <Button asChild className="gradient-button rounded-2xl px-6 h-12 font-black uppercase tracking-widest text-[10px]">
              <Link href="/landing">Ver Planos</Link>
            </Button>
          </div>
        )}
      </motion.div>
    );
  }

  // Banner personalizado
  if (message) {
    return (
      <Alert variant="default" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Informação</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    );
  }

  return null;
}

/**
 * Componente de Badge de Status
 * Mostra um badge discreto indicando o status da assinatura
 */
export function SubscriptionBadge({ status }: { status: 'active' | 'trial' | 'inactive' }) {
  const variants = {
    active: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-300',
      icon: CheckCircle,
      label: 'Ativo',
    },
    trial: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-800 dark:text-blue-300',
      icon: Clock,
      label: 'Trial',
    },
    inactive: {
      bg: 'bg-gray-100 dark:bg-gray-900/30',
      text: 'text-gray-800 dark:text-gray-300',
      icon: AlertTriangle,
      label: 'Expirado',
    },
  };

  const variant = variants[status];
  const Icon = variant.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${variant.bg} ${variant.text}`}>
      <Icon className="h-3 w-3" />
      {variant.label}
    </div>
  );
}
