'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { backgroundThemes, primaryThemes, applyTheme } from "@/lib/theme-config";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Aplicação síncrona inicial - executa imediatamente
  if (typeof window !== 'undefined' && !initialized) {
    let userId: string;
    let existingUserId = localStorage.getItem("CAIXINHAS_USER_ID");
    
    if (existingUserId) {
      userId = existingUserId;
    } else {
      let tempId = sessionStorage.getItem("temp_user_id");
      if (!tempId) {
        tempId = `temp_${Date.now()}`;
        sessionStorage.setItem("temp_user_id", tempId);
      }
      userId = tempId;
    }

    // Aplica temas imediatamente
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
  }

  // Função para aplicar temas salvos
  const applyStoredThemes = (userId: string) => {
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

    // Salva o userId no localStorage para outros componentes
    localStorage.setItem("CAIXINHAS_USER_ID", userId);
  };

  // Listener para mudanças no localStorage
  useEffect(() => {
    if (!currentUserId) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith(`app-theme-`) && e.key.includes(currentUserId)) {
        // Reaplica todos os temas quando há mudança
        applyStoredThemes(currentUserId);
      }
    };

    // Listener customizado para mudanças internas (mesma aba)
    const handleThemeChange = (event: CustomEvent) => {
      if (event.detail.userId === currentUserId) {
        applyStoredThemes(currentUserId);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('theme-changed' as any, handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('theme-changed' as any, handleThemeChange);
    };
  }, [currentUserId]);

  // Aplicação inicial dos temas (executado imediatamente na montagem)
  useEffect(() => {
    if (initialized) return; // Evita executar múltiplas vezes
    
    let userId: string;

    // Primeiro tenta usar o ID já salvo no localStorage
    let existingUserId = localStorage.getItem("CAIXINHAS_USER_ID");
    
    if (existingUserId) {
      userId = existingUserId;
    } else if (session?.user?.id) {
      userId = session.user.id;
    } else {
      // Se não há sessão nem ID salvo, usa um ID temporário
      let tempId = sessionStorage.getItem("temp_user_id");
      
      if (!tempId) {
        tempId = `temp_${Date.now()}`;
        sessionStorage.setItem("temp_user_id", tempId);
      }
      
      userId = tempId;
    }

    setCurrentUserId(userId);
    applyStoredThemes(userId);
    setInitialized(true);
  }, [initialized, session]); // Executa quando não foi inicializado ou quando a sessão muda

  // Atualiza o userId quando a sessão muda
  useEffect(() => {
    if (session?.user?.id && currentUserId !== session.user.id) {
      setCurrentUserId(session.user.id);
      applyStoredThemes(session.user.id);
    }
  }, [session, currentUserId]);

  return <>{children}</>;
}