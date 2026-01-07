'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { LoadingScreen } from '@/components/ui/loading-screen';

interface LoadingContextType {
  isLoading: boolean;
  message: string;
  progress: number;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  setLoadingMessage: (message: string) => void;
  setProgress: (progress: number) => void;
  completeProgress: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Carregando...');
  const [progress, setProgressState] = useState(0);
  
  const showLoading = (customMessage?: string) => {
    if (customMessage) {
      setMessage(customMessage);
    }
    setProgressState(0); // Reset progress ao abrir
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
    setProgressState(0); // Reset ao fechar
  };

  const setLoadingMessage = (newMessage: string) => {
    setMessage(newMessage);
  };

  const setProgress = (newProgress: number) => {
    setProgressState(Math.min(100, Math.max(0, newProgress)));
  };

  const completeProgress = () => {
    setProgressState(100);
  };

  // Auto hide loading after 10 seconds (safety)
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        hideLoading();
      }, 10000);
      
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  const value: LoadingContextType = {
    isLoading,
    message,
    progress,
    showLoading,
    hideLoading,
    setLoadingMessage,
    setProgress,
    completeProgress,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && <LoadingScreen message={message} progress={progress} />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

// Hook para loading automático em navegação
export function useNavigationLoading() {
  const { showLoading, hideLoading } = useLoading();
  
  const navigateWithLoading = async (
    navigationFn: () => Promise<void> | void,
    message = 'Navegando...'
  ) => {
    try {
      showLoading(message);
      await navigationFn();
      // Pequeno delay para UX
      setTimeout(hideLoading, 300);
    } catch (error) {
      hideLoading();
      throw error;
    }
  };

  return { navigateWithLoading };
}

// Hook para loading em ações/formulários
export function useActionLoading() {
  const { showLoading, hideLoading, setLoadingMessage } = useLoading();
  
  const executeWithLoading = async <T,>(
    actionFn: () => Promise<T>,
    message = 'Processando...',
    successMessage?: string
  ): Promise<T> => {
    try {
      showLoading(message);
      const result = await actionFn();
      
      if (successMessage) {
        setLoadingMessage(successMessage);
        setTimeout(hideLoading, 1000);
      } else {
        setTimeout(hideLoading, 300);
      }
      
      return result;
    } catch (error) {
      hideLoading();
      throw error;
    }
  };

  return { executeWithLoading };
}