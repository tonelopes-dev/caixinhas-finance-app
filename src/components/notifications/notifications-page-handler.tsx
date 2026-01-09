'use client';

import { useEffect } from 'react';
import { useLoading } from '@/components/providers/loading-provider';

/**
 * Componente que fecha o loading global quando a página de notificações renderiza
 */
export function NotificationsPageHandler() {
  const { hideLoading } = useLoading();

  useEffect(() => {
    // Aguarda um pouco para garantir que a página renderizou completamente
    const timer = setTimeout(() => {
      hideLoading();
    }, 300);

    return () => clearTimeout(timer);
  }, [hideLoading]);

  return null;
}
