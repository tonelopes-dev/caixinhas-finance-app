'use client';

import { useState, useCallback } from 'react';

interface AuthLoadingState {
  isVisible: boolean;
  message: string;
}

export function useAuthLoading() {
  const [loadingState, setLoadingState] = useState<AuthLoadingState>({
    isVisible: false,
    message: "Carregando..."
  });

  const showAuthLoading = useCallback((message: string = "Carregando...") => {
    setLoadingState({
      isVisible: true,
      message
    });
  }, []);

  const hideAuthLoading = useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      isVisible: false
    }));
  }, []);

  const setAuthLoading = useCallback((show: boolean, message?: string) => {
    if (show) {
      showAuthLoading(message);
    } else {
      hideAuthLoading();
    }
  }, [showAuthLoading, hideAuthLoading]);

  return {
    isVisible: loadingState.isVisible,
    message: loadingState.message,
    showAuthLoading,
    hideAuthLoading,
    setAuthLoading
  };
}