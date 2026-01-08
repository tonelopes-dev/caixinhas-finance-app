'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Download, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export function UpdateAvailableNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [newVersion, setNewVersion] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Obtém versão atual do SW ativo
    const getCurrentVersion = async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg?.active) {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          if (event.data.version) {
            setCurrentVersion(event.data.version);
            console.log('📦 Versão atual:', event.data.version);
          }
        };
        reg.active.postMessage({ type: 'GET_VERSION' }, [messageChannel.port2]);
      }
    };

    getCurrentVersion();

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

    // Verificação inteligente de atualizações
    let checkCount = 0;
    const maxChecks = 10; // Máximo de 10 verificações (5 horas)
    
    const checkForUpdates = async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        console.log('🔍 Verificando atualizações...');
        await reg.update();
        checkCount++;
        
        // Após algumas verificações, reduz a frequência
        if (checkCount >= maxChecks) {
          clearInterval(updateInterval);
          console.log('⏸️ Verificação automática pausada. Recarregue a página para retomar.');
        }
      }
    };

    // Verifica a cada 30 minutos, reduzindo após algumas checagens
    const updateInterval = setInterval(checkForUpdates, 30 * 60 * 1000);
    
    // Verifica também quando a aba volta ao foco
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkForUpdates();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(updateInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
          // Limpa storage API cache para garantir atualização completa
          if ('caches' in window) {
            caches.keys().then(names => {
              names.forEach(name => {
                if (!name.includes(newVersion)) {
                  caches.delete(name);
                }
              });
            });
          }
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
    <div className="fixed bottom-20 right-4 left-4 md:left-auto md:bottom-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/10 shadow-lg max-w-sm mx-auto md:mx-0">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <Zap className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  Nova versão disponível!
                </p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                  🎉
                </span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                Uma versão atualizada do Caixinhas está pronta com melhorias e correções. Atualize agora para a melhor experiência.
              </p>
              {currentVersion && (
                <p className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                  Versão atual: {currentVersion.substring(0, 16)}...
                </p>
              )}
              <div className="flex gap-2 mt-3 pt-2 border-t border-blue-200 dark:border-blue-800">
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="h-9 px-4 text-xs bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm flex-1"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Atualizar Agora
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  disabled={isUpdating}
                  className="h-9 px-3 text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900/20"
                >
                  Depois
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}