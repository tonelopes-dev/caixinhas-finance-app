'use client';

import { useState } from 'react';
import { LoadingButton } from '@/components/ui/loading-button';
import { Button } from '@/components/ui/button';
import { useLoading, useActionLoading } from '@/components/providers/loading-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InlineLoading } from '@/components/ui/loading-screen';

export default function LoadingTestPage() {
  const [buttonLoading, setButtonLoading] = useState(false);
  const { showLoading, hideLoading } = useLoading();
  const { executeWithLoading } = useActionLoading();

  const handleGlobalLoading = () => {
    showLoading('🎨 Testando tela de loading global...');
    setTimeout(() => {
      hideLoading();
    }, 4000);
  };

  const handleActionLoading = async () => {
    try {
      await executeWithLoading(
        async () => {
          // Simula uma ação async
          await new Promise(resolve => setTimeout(resolve, 3000));
        },
        '⚡ Executando ação especial...',
        '✅ Ação concluída com sucesso!'
      );
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleNavigationLoading = async () => {
    try {
      await executeWithLoading(
        async () => {
          // Simula navegação
          await new Promise(resolve => setTimeout(resolve, 2000));
          window.location.href = '/dashboard';
        },
        '🚀 Navegando para o dashboard...',
        '✅ Redirecionando...'
      );
    } catch (error) {
      console.error('Erro na navegação:', error);
    }
  };

  const handleButtonLoading = () => {
    setButtonLoading(true);
    setTimeout(() => {
      setButtonLoading(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            🎨 Teste de Loading Screens
          </h1>
          <p className="text-lg text-muted-foreground">
            Demonstração das telas de carregamento mais lindas do mundo!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Global Loading */}
          <Card className="border-2 border-primary/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🌍</span>
                <span>Loading Global</span>
              </CardTitle>
              <CardDescription>
                Tela de loading que cobre toda a aplicação com animações incríveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleGlobalLoading}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                Mostrar Loading Global
              </Button>
            </CardContent>
          </Card>

          {/* Action Loading */}
          <Card className="border-2 border-accent/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>⚡</span>
                <span>Loading de Ação</span>
              </CardTitle>
              <CardDescription>
                Loading automático para ações com mensagens personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleActionLoading}
                variant="outline"
                className="w-full border-accent/40 hover:bg-accent/10"
              >
                Executar Ação com Loading
              </Button>
            </CardContent>
          </Card>

          {/* Navigation Loading */}
          <Card className="border-2 border-primary/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🚀</span>
                <span>Loading de Navegação</span>
              </CardTitle>
              <CardDescription>
                Loading otimizado para transições entre páginas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleNavigationLoading}
                variant="secondary"
                className="w-full"
              >
                Navegar com Loading
              </Button>
            </CardContent>
          </Card>

          {/* Button Loading */}
          <Card className="border-2 border-accent/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🎯</span>
                <span>Loading em Botões</span>
              </CardTitle>
              <CardDescription>
                Botões com estados de loading integrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoadingButton 
                onClick={handleButtonLoading}
                loading={buttonLoading}
                loadingText="Processando..."
                className="w-full"
              >
                Botão com Loading
              </LoadingButton>
            </CardContent>
          </Card>
        </div>

        {/* Inline Loading Examples */}
        <Card className="border-2 border-primary/10 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🎪</span>
              <span>Loading Inline</span>
            </CardTitle>
            <CardDescription>
              Componentes de loading para usar em qualquer lugar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-center p-4 border rounded-lg">
                <InlineLoading size="sm" message="Pequeno" />
              </div>
              <div className="flex items-center justify-center p-4 border rounded-lg">
                <InlineLoading size="md" message="Médio" />
              </div>
              <div className="flex items-center justify-center p-4 border rounded-lg">
                <InlineLoading size="lg" message="Grande" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Variações de Loading Buttons */}
        <Card className="border-2 border-accent/10 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🎨</span>
              <span>Botões de Loading Variados</span>
            </CardTitle>
            <CardDescription>
              Diferentes estilos e tamanhos de botões com loading
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <LoadingButton variant="default" loading>
                Padrão
              </LoadingButton>
              <LoadingButton variant="secondary" loading>
                Secundário
              </LoadingButton>
              <LoadingButton variant="outline" loading>
                Outline
              </LoadingButton>
              <LoadingButton variant="destructive" loading>
                Destructive
              </LoadingButton>
            </div>
          </CardContent>
        </Card>

        {/* Voltar */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}