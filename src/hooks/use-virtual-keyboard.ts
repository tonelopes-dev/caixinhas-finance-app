"use client"

import { useEffect, useState } from 'react';

export function useVirtualKeyboard() {
  const [isVirtualKeyboardOpen, setIsVirtualKeyboardOpen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [initialHeight, setInitialHeight] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detecta se é um dispositivo móvel
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouchDevice = 'ontouchstart' in window;
    
    if (!isMobile && !isTouchDevice) return;

    const getViewportHeight = () => {
      return window.visualViewport?.height || window.innerHeight;
    };

    const currentHeight = getViewportHeight();
    setInitialHeight(currentHeight);
    setViewportHeight(currentHeight);

    const handleResize = () => {
      const currentViewportHeight = getViewportHeight();
      const heightDifference = initialHeight - currentViewportHeight;
      
      // Ajusta threshold baseado no dispositivo - mais sensível para mobile
      const keyboardThreshold = window.innerWidth > 768 ? 150 : 100;
      const isKeyboardOpen = heightDifference > keyboardThreshold;
      
      // Log para debug no mobile
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Virtual Keyboard Detection:', {
          initial: initialHeight,
          current: currentViewportHeight,
          difference: heightDifference,
          threshold: keyboardThreshold,
          isOpen: isKeyboardOpen
        });
      }
      
      setIsVirtualKeyboardOpen(isKeyboardOpen);
      setViewportHeight(currentViewportHeight);
    };

    const handleFocusIn = () => {
      // Aguarda um pouco para o teclado virtual aparecer
      setTimeout(handleResize, 300);
    };

    const handleFocusOut = () => {
      // Aguarda um pouco para o teclado virtual desaparecer
      setTimeout(handleResize, 300);
    };

    // Usar Visual Viewport API se disponível (mais preciso para detectar teclado virtual)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    } else {
      // Fallback para navegadores que não suportam Visual Viewport API
      window.addEventListener('resize', handleResize);
    }

    // Monitora eventos de foco para melhor detecção
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
      
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [initialHeight]);

  return {
    isVirtualKeyboardOpen,
    viewportHeight,
    initialHeight,
  };
}