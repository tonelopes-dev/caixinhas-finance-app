'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export function UpdateAvailableNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Detecta quando há nova versão disponível
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Nova versão do app detectada');
      setUpdateAvailable(true);
    });

    // Verifica se já há um service worker em waiting
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg?.waiting) {
        console.log('⏳ Nova versão já aguardando para ser ativada');
        setUpdateAvailable(true);
      }

      if (reg) {
        // Escuta por novas instalações
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            console.log('📦 Nova versão sendo instalada...');
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('✅ Nova versão instalada e pronta');
                setUpdateAvailable(true);
                
                toast({
                  title: "Nova versão disponível! 🎉",
                  description: "Uma versão atualizada do app está pronta para uso.",
                  duration: 8000,
                });
              }
            });
          }
        });
      }
    });

    // Força verificação de atualização a cada 30 minutos
    const updateInterval = setInterval(() => {
      navigator.serviceWorker.getRegistration().then((reg) => {
        reg?.update();
      });
    }, 30 * 60 * 1000);

    return () => {
      clearInterval(updateInterval);
    };
  }, []);

  const handleUpdate = async () => {
    if (!navigator.serviceWorker) return;
    
    setIsUpdating(true);
    
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration?.waiting) {
        // Avisa ao service worker em waiting para tomar controle
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Aguarda o service worker assumir controle
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('🔄 Recarregando com nova versão...');
          window.location.reload();
        }, { once: true });
      } else {
        // Se não há worker waiting, força update e reload
        await registration?.update();
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast({
        title: "Erro na atualização",
        description: "Não foi possível atualizar automaticamente. Recarregue a página manualmente.",
        variant: "destructive",
      });
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
    toast({
      title: "Atualização adiada",
      description: "Você pode atualizar mais tarde recarregando a página.",
      duration: 5000,
    });
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/10 max-w-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Download className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Nova versão disponível! 🎉
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Uma versão atualizada do Caixinhas está pronta com melhorias e correções.
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isUpdating ? (
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3 mr-1" />
                  )}
                  {isUpdating ? 'Atualizando...' : 'Atualizar Agora'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="h-8 px-3 text-xs text-blue-700 hover:text-blue-800 dark:text-blue-300"
                >
                  Mais Tarde
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}