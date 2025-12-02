'use client';

import { useState, useEffect } from 'react';

export function useConfettiOnce(key: string, shouldShow: boolean) {
  const [hasShown, setHasShown] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const storageKey = `confetti_shown_${key}`;
    const alreadyShown = localStorage.getItem(storageKey) === 'true';
    
    if (shouldShow && !alreadyShown && !hasShown) {
      setShowConfetti(true);
      setHasShown(true);
      localStorage.setItem(storageKey, 'true');
      
      // Remove confetes após 5 segundos
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [key, shouldShow, hasShown]);

  return showConfetti;
}