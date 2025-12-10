'use client';

import { useState, useEffect } from 'react';

const PRIVACY_STORAGE_KEY = 'caixinhas-privacy-mode';

export function usePrivacyMode() {
  const [isPrivate, setIsPrivate] = useState(true); // Default como privado
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PRIVACY_STORAGE_KEY);
      if (stored !== null) {
        setIsPrivate(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Erro ao carregar estado de privacidade:', error);
    }
    setIsLoaded(true);
  }, []);

  const togglePrivacy = () => {
    const newValue = !isPrivate;
    setIsPrivate(newValue);
    
    try {
      localStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(newValue));
    } catch (error) {
      console.warn('Erro ao salvar estado de privacidade:', error);
    }
  };

  return {
    isPrivate,
    togglePrivacy,
    isLoaded, // Para evitar flash de conteúdo durante carregamento
  };
}