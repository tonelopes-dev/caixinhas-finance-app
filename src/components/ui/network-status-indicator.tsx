'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNetworkRecovery, usePWADetection } from '@/hooks/use-network-recovery';
import { cn } from '@/lib/utils';

export function NetworkStatusIndicator() {
  const { networkStatus, forceRefresh, softRecovery } = useNetworkRecovery();
  const { isPWA, isStandalone } = usePWADetection();
  const [showOfflineCard, setShowOfflineCard] = useState(false);

  useEffect(() => {
    if (!networkStatus.isOnline) {
      // Mostra o card após 3 segundos offline
      const timer = setTimeout(() => {
        setShowOfflineCard(true);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setShowOfflineCard(false);
    }
  }, [networkStatus.isOnline]);

  // Indicador sempre visível no canto superior
  const StatusIndicator = () => (
    <div className={cn(
      "fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300",
      networkStatus.isOnline 
        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
    )}>
      {networkStatus.isReconnecting ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : networkStatus.isOnline ? (
        <Wifi className="h-4 w-4" />
      ) : (
        <WifiOff className="h-4 w-4" />
      )}
      {networkStatus.isReconnecting ? 'Reconectando...' : 
       networkStatus.isOnline ? 'Online' : 'Offline'}
    </div>
  );

  // Card de ajuda quando offline
  const OfflineHelpCard = () => (
    <div className="fixed inset-x-4 top-20 z-50 animate-in slide-in-from-top-4 duration-300">
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-900/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Você está offline
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {isPWA 
                  ? 'Algumas funcionalidades podem não funcionar. Verifique sua conexão.'
                  : 'Verifique sua conexão com a internet para continuar.'
                }
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={softRecovery}
                  className="h-8 px-3 text-xs bg-white/50"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Tentar Novamente
                </Button>
                {(isPWA || isStandalone) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={forceRefresh}
                    className="h-8 px-3 text-xs bg-white/50"
                  >
                    <Wifi className="h-3 w-3 mr-1" />
                    Limpar Cache
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowOfflineCard(false)}
                  className="h-8 px-3 text-xs"
                >
                  ✕
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <StatusIndicator />
      {showOfflineCard && <OfflineHelpCard />}
    </>
  );
}