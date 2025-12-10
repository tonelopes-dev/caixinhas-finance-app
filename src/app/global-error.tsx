'use client';

import { RefreshCw, Home, AlertTriangle, Smartphone, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function GlobalErrorPage() {
  const handleHardRefresh = () => {
    // Limpar cache do service worker se existir
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      });
    }
    
    // Limpar localStorage e sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Forçar refresh completo
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  return (
    <html>
      <body>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl">Ops! Erro Crítico</CardTitle>
              <CardDescription>
                Algo deu muito errado. Vamos resolver isso juntos!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Instruções específicas para PWA/Mobile */}
              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <div className="flex items-start gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-muted-foreground mb-2">
                      Soluções recomendadas:
                    </p>
                    <ol className="text-muted-foreground space-y-1 text-xs list-decimal list-inside">
                      <li>Limpe o cache e recarregue a página</li>
                      <li>Se estiver usando o app, remova e adicione novamente</li>
                      <li>Verifique sua conexão com a internet</li>
                      <li>Tente acessar pelo navegador diretamente</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleHardRefresh}
                  className="w-full"
                  size="lg"
                >
                  <Wifi className="mr-2 h-4 w-4" />
                  Limpar Cache e Recarregar
                </Button>

                <Button
                  onClick={handleGoHome}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Voltar ao Início
                </Button>

                <Button
                  onClick={() => window.location.href = '/login'}
                  variant="secondary"
                  className="w-full"
                  size="lg"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Fazer Login Novamente
                </Button>
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Se o problema persistir, entre em contato conosco em{' '}
                  <a 
                    href="mailto:suporte@caixinhas.app" 
                    className="text-primary hover:underline"
                  >
                    suporte@caixinhas.app
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}