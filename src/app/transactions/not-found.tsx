'use client';

import { Receipt, Home, ArrowLeft, Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TransactionsNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-0 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-6 relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 mx-auto">
              <Receipt className="h-10 w-10 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-r from-red-400 to-pink-400 opacity-80 animate-pulse"></div>
          </div>
          
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Transação não encontrada
          </CardTitle>
          <CardDescription className="text-base mt-3">
            A transação que você está procurando não existe, foi removida ou você não tem acesso a ela.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Código de erro temático */}
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10 rounded-xl p-6 text-center border border-violet-200 dark:border-violet-800/50">
            <div className="text-4xl mb-2">💳</div>
            <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">
              Transação inexistente
            </span>
            <p className="text-sm text-muted-foreground mt-2">
              ID da transação inválido ou inacessível
            </p>
          </div>

          {/* Sugestões específicas */}
          <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-4 border border-amber-200 dark:border-amber-800/50">
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 text-sm">
              🔍 Possíveis causas:
            </h3>
            <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
              <li>• A transação foi excluída</li>
              <li>• Você não tem permissão para visualizá-la</li>
              <li>• O link está incorreto ou expirado</li>
              <li>• A transação pertence a outra caixinha</li>
            </ul>
          </div>

          {/* Botões de ação */}
          <div className="space-y-3">
            <Button
              onClick={() => router.back()}
              variant="default"
              className="w-full h-12 text-base font-medium bg-violet-600 hover:bg-violet-700"
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
                <Link href="/transactions">
                  <Receipt className="mr-2 h-4 w-4" />
                  Todas Transações
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-12"
              >
                <Link href="/goals">
                  <Plus className="mr-2 h-4 w-4" />
                  Minhas Caixinhas
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

          {/* Links rápidos para transações */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Ações rápidas:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link href="/reports" className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 border border-blue-200 dark:border-blue-800/50 hover:scale-105 transition-transform">
                <div className="text-center">
                  <TrendingUp className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                  <div className="font-medium text-blue-700 dark:text-blue-300">Relatórios</div>
                </div>
              </Link>
              <Link href="/transactions?filter=recent" className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800/50 hover:scale-105 transition-transform">
                <div className="text-center">
                  <Receipt className="h-4 w-4 mx-auto mb-1 text-green-600" />
                  <div className="font-medium text-green-700 dark:text-green-300">Recentes</div>
                </div>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}