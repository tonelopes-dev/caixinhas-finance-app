'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLoading } from '@/components/providers/loading-provider';

export function InitialLoadingHandler() {
  const { hideLoading } = useLoading();
  const pathname = usePathname();

  useEffect(() => {
    // Não mostrar loading na página landing
    if (pathname === '/landing') {
      hideLoading();
      return;
    }

    // Espera o app renderizar completamente antes de esconder o loading
    const timer = setTimeout(() => {
      hideLoading();
    }, 800);

    return () => clearTimeout(timer);
  }, [hideLoading, pathname]);

  return null;
}
