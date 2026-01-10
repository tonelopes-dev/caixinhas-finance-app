'use client';

import { useEffect } from 'react';
import { useLoading } from '@/components/providers/loading-provider';

export function InitialLoadingHandler() {
  const { hideLoading } = useLoading();

  useEffect(() => {
    // Espera o app renderizar completamente antes de esconder o loading
    const timer = setTimeout(() => {
      hideLoading();
    }, 800);

    return () => clearTimeout(timer);
  }, [hideLoading]);

  return null;
}
