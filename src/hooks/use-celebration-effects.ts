'use client';

import { useCallback } from 'react';

export function useCelebrationEffects() {
  // Vibração tátil personalizada
  const triggerHapticPattern = useCallback((pattern: 'success' | 'achievement' | 'milestone') => {
    if ('vibrate' in navigator) {
      const patterns = {
        success: [100, 50, 100], // Rápido e satisfatório
        achievement: [200, 100, 200, 100, 300], // Mais elaborado
        milestone: [300, 200, 300, 200, 500], // Mais longo e impactante
      };
      navigator.vibrate(patterns[pattern]);
    }
  }, []);

  // Efeito de shake na tela (para dispositivos móveis)
  const triggerScreenShake = useCallback(() => {
    if ('DeviceMotionEvent' in window) {
      // Simula um pequeno tremor visual
      document.body.style.animation = 'celebrate-shake 0.5s ease-in-out';
      
      setTimeout(() => {
        document.body.style.animation = '';
      }, 500);
    }
  }, []);

  // Função para destacar e fazer scroll até o card da meta
  const highlightGoalCard = useCallback((goalId: string) => {
    const goalElement = document.querySelector(`[data-goal-id="${goalId}"]`);
    if (goalElement) {
      // Scroll suave até o elemento
      goalElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
      
      // Adiciona classe de destaque
      goalElement.classList.add('goal-celebration-highlight');
      
      // Remove o destaque após a animação
      setTimeout(() => {
        goalElement.classList.remove('goal-celebration-highlight');
      }, 4000);
    }
  }, []);

  // Celebração completa baseada no nível de conquista
  const celebrate = useCallback((level: 'small' | 'medium' | 'big', goalCount: number, goalId?: string) => {
    if (level === 'small') {
      triggerHapticPattern('success');
    } else if (level === 'medium') {
      triggerHapticPattern('achievement');
    } else if (level === 'big') {
      triggerHapticPattern('milestone');
      triggerScreenShake();
    }
    
    // Destaca o card da meta se o ID for fornecido
    if (goalId) {
      // Aguarda um pouco para garantir que os confetes estejam visíveis primeiro
      setTimeout(() => {
        highlightGoalCard(goalId);
      }, 1000);
    }
  }, [triggerHapticPattern, triggerScreenShake, highlightGoalCard]);

  return {
    triggerHapticPattern,
    triggerScreenShake,
    highlightGoalCard,
    celebrate,
  };
}