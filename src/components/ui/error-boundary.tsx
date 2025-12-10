'use client';

import React from 'react';
import { RefreshCw, Home, AlertCircle, Smartphone, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error: Error | null;
    reset: () => void;
    resetErrorBoundary: () => void;
  }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { 
      hasError: true, 
      error, 
      errorInfo: null 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Log do erro para monitoramento
    if (typeof window !== 'undefined') {
      // Aqui você pode integrar com serviços como Sentry, LogRocket, etc.
      console.error('Client Error Details:', {
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleHardRefresh = () => {
    if (typeof window !== 'undefined') {
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
    }
  };

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            reset={this.handleReset}
            resetErrorBoundary={this.handleReset}
          />
        );
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Oops! Algo deu errado</CardTitle>
              <CardDescription>
                Ocorreu um erro inesperado. Não se preocupe, vamos te ajudar a resolver isso!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Instruções para PWA */}
              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <div className="flex items-start gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-muted-foreground mb-2">
                      Se você está usando o app da tela inicial:
                    </p>
                    <ol className="text-muted-foreground space-y-1 text-xs list-decimal list-inside">
                      <li>Primeiro, tente o botão "Tentar Novamente" abaixo</li>
                      <li>Se não funcionar, use "Atualizar Completamente"</li>
                      <li>Em último caso, remova e adicione o app novamente à tela inicial</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={this.handleReset}
                  className="w-full"
                  size="lg"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar Novamente
                </Button>

                <Button
                  onClick={this.handleHardRefresh}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Wifi className="mr-2 h-4 w-4" />
                  Atualizar Completamente
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="secondary"
                  className="w-full"
                  size="lg"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Ir para o Início
                </Button>
              </div>

              {/* Detalhes do erro apenas em desenvolvimento */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-xs">
                  <summary className="cursor-pointer text-muted-foreground">
                    Detalhes técnicos (apenas em desenvolvimento)
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words bg-muted p-3 rounded text-xs overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}