'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Check, Download, RefreshCw, Zap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

// Rotas públicas onde NÃO deve mostrar notificação de atualização
const PUBLIC_ROUTES = [
  '/landing',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/terms',
  '/privacy',
];

export function UpdateAvailableNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string>('');
  // @ts-expect-error - pendencia estrutural a ser revisada
  const [newVersion, setNewVersion] = useState<string>('');
  
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Verifica se está em rota pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));
  
  // Só mostra notificação se:
  // 1. Usuário está autenticado
  // 2. Não está em rota pública
  // 3. Há atualização disponível
  const shouldShowNotification = session && !isPublicRoute && updateAvailable;

  // Verifica se acabou de atualizar e mostra celebração
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const justUpdated = localStorage.getItem('app_just_updated');
    
    if (justUpdated === 'true') {
      // Limpa o flag
      localStorage.removeItem('app_just_updated');
      
      // Aguarda o app renderizar completamente (500ms)
      setTimeout(() => {
        setIsSuccess(true);
        setShowConfetti(true);
        
        // Esconde a celebração após 1500ms
        setTimeout(() => {
          setIsSuccess(false);
          setShowConfetti(false);
        }, 1500);
      }, 500);
    }
  }, []);

  useEffect(() => {
    // Não ativa sistema de update em rotas públicas ou se não autenticado
    if (typeof window === 'undefined' || 
        !('serviceWorker' in navigator) || 
        isPublicRoute || 
        status === 'unauthenticated') {
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
  }, [isPublicRoute, status]); // Reinicia quando muda rota ou status de autenticação

  const handleUpdate = async () => {
    if (!navigator.serviceWorker) return;
    
    setIsUpdating(true);
    
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration?.waiting) {
        // Avisa ao service worker em waiting para tomar controle
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Aguarda o service worker assumir controle
        const controllerChangePromise = new Promise<void>((resolve) => {
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('🔄 Service worker assumiu controle');
            resolve();
          }, { once: true });
        });
        
        // Aguarda no máximo 2s para o SW assumir controle
        await Promise.race([
          controllerChangePromise,
          new Promise(resolve => setTimeout(resolve, 2000))
        ]);
        
        // Limpa storage API cache
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              if (!name.includes(newVersion)) {
                caches.delete(name);
              }
            });
          });
        }
      } else {
        // Se não há worker waiting, força update
        await registration?.update();
      }
      
      // Salva flag para mostrar celebração DEPOIS do reload
      localStorage.setItem('app_just_updated', 'true');
      
      // Recarrega imediatamente
      window.location.reload();
      
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      
      // Mesmo com erro, tenta recarregar
      localStorage.setItem('app_just_updated', 'true');
      window.location.reload();
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

  // Não renderiza se não deve mostrar
  if (!shouldShowNotification) {
    return null;
  }

  // Cores dinâmicas baseadas no estado
  const cardClass = isSuccess 
    ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/10 shadow-lg max-w-sm mx-auto md:mx-0 transition-all duration-500"
    : "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/10 shadow-lg max-w-sm mx-auto md:mx-0 transition-all duration-500";
  
  const iconBgClass = isSuccess
    ? "h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md transition-all duration-500"
    : "h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md transition-all duration-500";

  return (
    <>
      {/* Confetes de Celebração */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={600}
          gravity={0.25}
          colors={['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#fbbf24', '#f59e0b']}
        />
      )}

      {/* Modal de Sucesso (aparece por cima de tudo) */}
      {isSuccess && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-green-950 dark:via-gray-900 dark:to-emerald-950 rounded-2xl shadow-2xl p-8 max-w-md mx-4 animate-in zoom-in-95 duration-500 border-2 border-green-200 dark:border-green-800">
            {/* Ícone de Sucesso Animado */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
                <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <Check className="h-10 w-10 text-white animate-in zoom-in duration-500" strokeWidth={3} />
                </div>
              </div>
            </div>

            {/* Mensagem de Sucesso */}
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 animate-in slide-in-from-bottom-2 duration-500">
                ✨ App Atualizado!
              </h2>
              <p className="text-sm text-green-700 dark:text-green-300 animate-in slide-in-from-bottom-3 duration-700">
                Seu Caixinhas foi atualizado com sucesso!<br />
                Preparando a melhor experiência para você...
              </p>
              
              {/* Barra de progresso animada */}
              <div className="mt-6 pt-4 animate-in slide-in-from-bottom-4 duration-1000">
                <div className="h-1.5 bg-green-200 dark:bg-green-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full animate-pulse"
                    style={{ 
                      width: '100%',
                      animation: 'pulse 1.5s ease-in-out'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Card de Notificação (apenas quando não está em sucesso) */}
      {!isSuccess && (
        <div className="fixed bottom-20 right-4 left-4 md:left-auto md:bottom-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <Card className={cardClass}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className={iconBgClass}>
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
                  <p className="text-xs leading-relaxed text-blue-700 dark:text-blue-300">
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
      )}
    </>
  );
}