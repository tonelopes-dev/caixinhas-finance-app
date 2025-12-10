'use client';

import { Home, ArrowLeft, Search, Compass, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use404Analytics, useCommon404Patterns } from '@/hooks/use-404-analytics';

export default function NotFound() {
  const router = useRouter();
  const { suggestions } = use404Analytics();
  const { pattern, message } = useCommon404Patterns();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-0 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-6 relative">
            {/* Ícone principal */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 mx-auto">
              <Compass className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
            {/* Efeito decorativo */}
            <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-r from-orange-400 to-pink-400 opacity-80 animate-pulse"></div>
            <div className="absolute -bottom-1 -left-1 h-4 w-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 opacity-60 animate-pulse delay-300"></div>
          </div>
          
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Página não encontrada
          </CardTitle>
          <CardDescription className="text-base mt-3">
            Ops! A página que você está procurando não existe ou foi movida para outro lugar.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Código de erro estilizado */}
          <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl p-6 text-center border border-muted/50">
            <span className="text-6xl font-black text-muted-foreground/30 tracking-wider">
              404
            </span>
            <p className="text-sm text-muted-foreground mt-2">
              Erro: Recurso não encontrado
            </p>
          </div>

          {/* Detecção de padrão */}
          {message && (
            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-4 border border-amber-200 dark:border-amber-800/50">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 text-sm flex items-center">
                <Lightbulb className="h-4 w-4 mr-2" />
                Observação:
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">{message}</p>
            </div>
          )}

          {/* Sugestões inteligentes */}
          {suggestions.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-200 dark:border-blue-800/50">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 text-sm">
                🎯 Sugestões baseadas na sua busca:
              </h3>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <Link
                    key={suggestion.path}
                    href={suggestion.path}
                    className="block p-2 rounded-md bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-colors border border-blue-200/50 dark:border-blue-700/50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          {suggestion.label}
                        </span>
                        <p className="text-xs text-blue-600 dark:text-blue-300">
                          {suggestion.description}
                        </p>
                      </div>
                      <div className="text-xs text-blue-500 font-mono">
                        {Math.round(suggestion.confidence * 100)}%
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Dicas gerais */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <h3 className="font-semibold mb-2">💡 Dicas gerais:</h3>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>• Verifique se a URL está correta</li>
              <li>• Use os botões abaixo para navegar</li>
              <li>• Acesse o menu principal para encontrar o que precisa</li>
            </ul>
          </div>

          {/* Botões de ação */}
          <div className="space-y-3">
            <Button
              onClick={() => router.back()}
              variant="default"
              className="w-full h-12 text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Voltar à Página Anterior
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                asChild
                variant="outline"
                className="h-12 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link href="/dashboard">
                  <Home className="mr-2 h-4 w-4" />
                  Painel Principal
                </Link>
              </Button>

              <Button
                asChild
                variant="outline" 
                className="h-12 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link href="/goals">
                  <Search className="mr-2 h-4 w-4" />
                  Ver Caixinhas
                </Link>
              </Button>
            </div>
          </div>

          {/* Links rápidos */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Acesso rápido:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/goals/new" className="text-xs px-3 py-1 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                Nova Caixinha
              </Link>
              <Link href="/transactions" className="text-xs px-3 py-1 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                Transações
              </Link>
              <Link href="/reports" className="text-xs px-3 py-1 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                Relatórios
              </Link>
              <Link href="/profile" className="text-xs px-3 py-1 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                Perfil
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}