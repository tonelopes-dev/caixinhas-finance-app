'use client';

import { Target, Home, ArrowLeft, Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GoalsNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-0 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-6 relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 mx-auto">
              <Target className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 opacity-80 animate-bounce"></div>
          </div>
          
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            Caixinha não encontrada
          </CardTitle>
          <CardDescription className="text-base mt-3">
            A caixinha que você está procurando não existe, foi removida ou você não tem permissão para acessá-la.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Código de erro temático */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 rounded-xl p-6 text-center border border-emerald-200 dark:border-emerald-800/50">
            <div className="text-4xl mb-2">🎯</div>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              Caixinha não encontrada
            </span>
            <p className="text-sm text-muted-foreground mt-2">
              ID da caixinha inválido ou inacessível
            </p>
          </div>

          {/* Sugestões específicas */}
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-200 dark:border-blue-800/50">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm">
              🤔 Possíveis motivos:
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• A caixinha foi excluída pelo proprietário</li>
              <li>• Você não tem permissão para acessá-la</li>
              <li>• O link está quebrado ou expirado</li>
              <li>• Houve um erro na digitação da URL</li>
            </ul>
          </div>

          {/* Botões de ação */}
          <div className="space-y-3">
            <Button
              onClick={() => router.back()}
              variant="default"
              className="w-full h-12 text-base font-medium bg-emerald-600 hover:bg-emerald-700"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Voltar à Página Anterior
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                asChild
                variant="outline"
                className="h-12"
              >
                <Link href="/goals">
                  <Target className="mr-2 h-4 w-4" />
                  Minhas Caixinhas
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-12"
              >
                <Link href="/goals/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Caixinha
                </Link>
              </Button>
            </div>

            <Button
              asChild
              variant="secondary"
              className="w-full h-12"
            >
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Voltar ao Painel
              </Link>
            </Button>
          </div>

          {/* Sugestões de caixinhas */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Que tal criar uma nova caixinha?
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link href="/goals/new?template=casa" className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800/50 hover:scale-105 transition-transform">
                <div className="text-center">
                  <div className="text-lg mb-1">🏠</div>
                  <div className="font-medium text-blue-700 dark:text-blue-300">Casa Própria</div>
                </div>
              </Link>
              <Link href="/goals/new?template=viagem" className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border border-purple-200 dark:border-purple-800/50 hover:scale-105 transition-transform">
                <div className="text-center">
                  <div className="text-lg mb-1">✈️</div>
                  <div className="font-medium text-purple-700 dark:text-purple-300">Viagem</div>
                </div>
              </Link>
              <Link href="/goals/new?template=carro" className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800/50 hover:scale-105 transition-transform">
                <div className="text-center">
                  <div className="text-lg mb-1">🚗</div>
                  <div className="font-medium text-green-700 dark:text-green-300">Carro</div>
                </div>
              </Link>
              <Link href="/goals/new?template=educacao" className="p-3 rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/10 dark:to-yellow-900/10 border border-orange-200 dark:border-orange-800/50 hover:scale-105 transition-transform">
                <div className="text-center">
                  <div className="text-lg mb-1">📚</div>
                  <div className="font-medium text-orange-700 dark:text-orange-300">Educação</div>
                </div>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}