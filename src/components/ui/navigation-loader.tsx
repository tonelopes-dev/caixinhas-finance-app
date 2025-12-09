'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Loader2, Zap, Sparkles } from 'lucide-react';

export function NavigationLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    const handleStart = () => {
      setIsLoading(true);
      setProgress(0);
      
      // Progresso rápido e suave
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 25 + 5;
        });
      }, 100);
    };

    const handleComplete = () => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 300);
      
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };

    // Intercepta cliques em links para mostrar loading
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && !link.href.startsWith('mailto:') && !link.href.startsWith('tel:') && !link.target) {
        const url = new URL(link.href);
        const currentUrl = new URL(window.location.href);
        
        // Só mostra loading para navegação interna
        if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
          handleStart();
        }
      }
    };

    // Adiciona listener para cliques
    document.addEventListener('click', handleLinkClick);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleLinkClick);
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, []);

  // Detecta mudanças de pathname para completar loading
  useEffect(() => {
    if (isLoading) {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 150);
    }
  }, [pathname, isLoading]);

  return (
    <>
      {isLoading && (
        <>
          {/* Barra de progresso no topo */}
          <div
            className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-primary via-accent to-primary origin-left transition-all duration-300 ease-out"
            style={{ 
              transform: `scaleX(${progress / 100})`,
            }}
          />

          {/* Loading indicator no canto superior direito */}
          <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center space-x-3 bg-card/95 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-border/50 animate-pulse">
              <div className="relative">
                <Zap className="w-4 h-4 text-primary animate-bounce" />
                <Sparkles className="w-2 h-2 text-accent absolute -top-1 -right-1 animate-ping" />
              </div>
              <div className="flex items-center space-x-2">
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                <span className="text-xs font-medium text-foreground">Navegando</span>
              </div>
            </div>
          </div>

          {/* Overlay sutil */}
          <div className="fixed inset-0 z-40 bg-background/20 backdrop-blur-[1px] animate-in fade-in duration-200" />
        </>
      )}
    </>
  );
}

// Hook para usar navegação com loading manual
export function useQuickNavigation() {
  const [isNavigating, setIsNavigating] = useState(false);

  const navigateWithLoading = async (navigationFn: () => void | Promise<void>) => {
    setIsNavigating(true);
    
    try {
      await navigationFn();
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      // Pequeno delay para UX suave
      setTimeout(() => setIsNavigating(false), 300);
    }
  };

  return { isNavigating, navigateWithLoading };
}