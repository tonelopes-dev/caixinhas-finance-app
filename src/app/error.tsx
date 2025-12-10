'use client';

import { useEffect } from 'react';
import { RefreshCw, Home, AlertCircle, Smartphone, Wifi, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log do erro para monitoramento
    console.error('Global Error Page:', {
      error: error.toString(),
      stack: error.stack,
      digest: error.digest,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

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

  const handleReportBug = () => {
    // Você pode integrar com um sistema de tickets ou email
    const subject = encodeURIComponent('Bug Report - Caixinhas App');
    const body = encodeURIComponent(`
Descrição do erro:
${error.toString()}

URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}

Stack trace:
${error.stack || 'Não disponível'}
    `);
    
    window.open(`mailto:suporte@caixinhas.app?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Algo deu errado!</CardTitle>
          <CardDescription>
            Ocorreu um erro inesperado. Não se preocupe, vamos te ajudar a resolver isso rapidamente!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Instruções específicas para PWA/Mobile */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-muted-foreground mb-2">
                  Para usuários do app na tela inicial:
                </p>
                <ol className="text-muted-foreground space-y-1 text-xs list-decimal list-inside">
                  <li>Primeiro, tente "Tentar Novamente"</li>
                  <li>Se persistir, use "Limpar Cache e Recarregar"</li>
                  <li>Em último caso, remova e adicione o app novamente</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={reset}
              className="w-full"
              size="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>

            <Button
              onClick={handleHardRefresh}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Wifi className="mr-2 h-4 w-4" />
              Limpar Cache e Recarregar
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleGoHome}
                variant="secondary"
                size="lg"
              >
                <Home className="mr-2 h-4 w-4" />
                Início
              </Button>

              <Button
                onClick={handleReportBug}
                variant="secondary"
                size="lg"
              >
                <Bug className="mr-2 h-4 w-4" />
                Reportar
              </Button>
            </div>
          </div>

          {/* ID do erro se disponível */}
          {error.digest && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                ID do Erro: <code className="bg-muted px-1 rounded">{error.digest}</code>
              </p>
            </div>
          )}

          {/* Detalhes do erro apenas em desenvolvimento */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Detalhes técnicos (desenvolvimento)
              </summary>
              <pre className="mt-2 whitespace-pre-wrap break-words bg-muted p-3 rounded text-xs overflow-auto max-h-40 border">
                {error.toString()}
                {'\n\n'}
                {error.stack}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}