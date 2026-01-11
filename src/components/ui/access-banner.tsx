/**
 * Componente de Banner de Acesso Restrito
 * 
 * Exibe alertas e informações sobre o status de acesso do usuário
 * baseado no sistema de controle de acesso definido em access-control.ts
 */

'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Terminal, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { PremiumBadge } from '@/components/ui/premium-badge';

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
      <Alert variant="default" className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
        <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="text-amber-900 dark:text-amber-100">
          Período de Teste
        </AlertTitle>
        <AlertDescription className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-amber-800 dark:text-amber-200">
          <span>
            {message || `Seu período de teste expira em ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'}. Assine agora para manter acesso total!`}
          </span>
          {showUpgradeButton && (
            <Button asChild size="sm" variant="default">
              <Link href="/landing">Ver Planos</Link>
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Banner para trial expirado / acesso inativo
  if (status === 'inactive' || (status === 'trial' && daysRemaining <= 0)) {
    return (
      <Alert variant="destructive" className="mb-6">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Acesso Restrito</AlertTitle>
        <AlertDescription className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="mb-2">
              {message || 'Seu período de teste terminou. Para continuar usando seu espaço pessoal e criar novos cofres, por favor, assine um de nossos planos.'}
            </p>
            <p className="text-sm opacity-90">
              ℹ️ Você ainda pode aceitar convites e colaborar em cofres de outros usuários.
            </p>
          </div>
          {showUpgradeButton && (
            <Button asChild size="sm">
              <Link href="/landing">Ver Planos</Link>
            </Button>
          )}
        </AlertDescription>
      </Alert>
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
