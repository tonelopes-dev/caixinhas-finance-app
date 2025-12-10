'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Extensão de tipos para navegador
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

interface NetworkStatus {
  isOnline: boolean;
  isReconnecting: boolean;
  lastDisconnected?: Date;
}

export function useNetworkRecovery() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator?.onLine ?? true,
    isReconnecting: false,
  });
  const router = useRouter();

  useEffect(() => {
    function handleOnline() {
      console.log('🟢 Rede reconectada');
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: true,
        isReconnecting: true,
      }));

      // Após reconectar, aguarda um pouco e tenta atualizar
      setTimeout(() => {
        setNetworkStatus(prevState => {
          const newState = { ...prevState, isReconnecting: false };
          
          // Se estava offline por mais de 30 segundos, força refresh
          if (prevState.lastDisconnected && 
              new Date().getTime() - prevState.lastDisconnected.getTime() > 30000) {
            console.log('🔄 Reconexão após longo período - fazendo refresh');
            window.location.reload();
          }
          
          return newState;
        });
      }, 2000);
    }

    function handleOffline() {
      console.log('🔴 Rede desconectada');
      setNetworkStatus(prevState => ({
        ...prevState,
        isOnline: false,
        isReconnecting: false,
        lastDisconnected: new Date(),
      }));
    }

    // Detecta mudanças na conexão
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detecta erros de carregamento que podem indicar problemas de cache
    window.addEventListener('unhandledrejection', (event) => {
      console.log('🚨 Erro não tratado detectado:', event.reason);
      
      // Se for erro de rede ou fetch, pode ser problema de cache
      if (event.reason?.name === 'TypeError' && 
          (event.reason?.message?.includes('fetch') || 
           event.reason?.message?.includes('Failed to fetch'))) {
        console.log('💾 Possível problema de cache detectado');
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Função para forçar atualização quando há problemas
  const forceRefresh = () => {
    console.log('🔄 Forçando refresh completo...');
    
    // Limpar cache se possível
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      });
    }

    // Limpar storages
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Não foi possível limpar storage:', e);
    }

    // Refresh forçado
    window.location.reload();
  };

  // Função para tentar recuperação suave
  const softRecovery = () => {
    console.log('🧘 Tentando recuperação suave...');
    router.refresh();
  };

  return {
    networkStatus,
    forceRefresh,
    softRecovery,
  };
}

// Hook para detectar se o app está rodando como PWA
export function usePWADetection() {
  const [isPWA, setIsPWA] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detecta se está rodando como PWA
    const isPWAMode = window.matchMedia('(display-mode: standalone)').matches ||
                      window.navigator.standalone ||
                      document.referrer.includes('android-app://');

    // Detecta se está em modo standalone (adicionado à tela inicial)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                             window.navigator.standalone === true;

    setIsPWA(isPWAMode);
    setIsStandalone(isStandaloneMode);

    console.log('📱 PWA Detection:', { 
      isPWA: isPWAMode, 
      isStandalone: isStandaloneMode 
    });
  }, []);

  return { isPWA, isStandalone };
}