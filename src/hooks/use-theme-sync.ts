'use client';

import { useEffect } from 'react';
import { backgroundThemes, primaryThemes, applyTheme } from '@/lib/theme-config';

export function useThemeSync() {
  useEffect(() => {
    const syncThemes = () => {
      // Pega o userId atual
      let userId = localStorage.getItem("CAIXINHAS_USER_ID");
      if (!userId) {
        userId = sessionStorage.getItem("temp_user_id") || `temp_${Date.now()}`;
        sessionStorage.setItem("temp_user_id", userId);
      }

      // Aplica os temas salvos
      const storedBg = localStorage.getItem(`app-theme-background-${userId}`) || "Padrão";
      const storedPrimary = localStorage.getItem(`app-theme-primary-${userId}`) || "Padrão";
      
      const bgTheme = backgroundThemes.find(t => t.name === storedBg);
      const primaryTheme = primaryThemes.find(t => t.name === storedPrimary);
      
      if (bgTheme) {
        applyTheme('background', bgTheme.color);
      }
      if (primaryTheme) {
        applyTheme('primary', primaryTheme.color);
      }
    };

    // Executa imediatamente
    syncThemes();

    // Escuta mudanças no localStorage
    const handleStorageChange = () => {
      syncThemes();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('theme-changed', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('theme-changed', handleStorageChange);
    };
  }, []);
}