'use client';

import { useEffect } from 'react';
import { useLoading } from '@/components/providers/loading-provider';

/**
 * Componente que detecta navegação de workspace e fecha o loading
 * quando a página dashboard renderiza completamente
 */
export function WorkspaceNavigationHandler() {
  const { hideLoading } = useLoading();

  useEffect(() => {
    // Verifica se há navegação de workspace pendente
    if (typeof window !== 'undefined') {
      const isPending = localStorage.getItem('workspace-navigation-pending');
      
      if (isPending === 'true') {
        console.log('🟢 [Dashboard] Detectou navegação de workspace, aguardando render...');
        
        // Aguarda a página renderizar completamente antes de fechar o loading
        const timer = setTimeout(() => {
          console.log('✅ [Dashboard] Página renderizada, fechando loading');
          localStorage.removeItem('workspace-navigation-pending');
          hideLoading();
        }, 1000); // 1000ms - delay aumentado para garantir render completo
        
        return () => clearTimeout(timer);
      }
    }
  }, [hideLoading]);

  return null;
}
