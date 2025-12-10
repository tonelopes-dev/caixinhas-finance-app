'use client';

import { BarChart3, Home, ArrowLeft, FileText, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ReportsNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-0 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-6 relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/20 mx-auto">
              <BarChart3 className="h-10 w-10 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 opacity-80 animate-pulse"></div>
          </div>
          
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Relatório não encontrado
          </CardTitle>
          <CardDescription className="text-base mt-3">
            O relatório que você está buscando não existe, foi removido ou você não tem permissão para acessá-lo.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Código de erro temático */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10 rounded-xl p-6 text-center border border-cyan-200 dark:border-cyan-800/50">
            <div className="text-4xl mb-2">📊</div>
            <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
              Dados não disponíveis
            </span>
            <p className="text-sm text-muted-foreground mt-2">
              Relatório inexistente ou inacessível
            </p>
          </div>

          {/* Sugestões específicas */}
          <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800/50">
            <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2 text-sm">
              📈 Possíveis motivos:
            </h3>
            <ul className="text-sm text-emerald-700 dark:text-emerald-300 space-y-1">
              <li>• O relatório foi excluído ou expirou</li>
              <li>• Você não tem acesso a estes dados</li>
              <li>• O período solicitado não possui dados</li>
              <li>• Houve um erro na URL do relatório</li>
            </ul>
          </div>

          {/* Botões de ação */}
          <div className="space-y-3">
            <Button
              onClick={() => router.back()}
              variant="default"
              className="w-full h-12 text-base font-medium bg-cyan-600 hover:bg-cyan-700"
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
                <Link href="/reports">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Todos Relatórios
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-12"
              >
                <Link href="/reports/new">
                  <FileText className="mr-2 h-4 w-4" />
                  Novo Relatório
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

          {/* Tipos de relatórios disponíveis */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Relatórios disponíveis:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link href="/reports?type=monthly" className="p-3 rounded-lg bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/10 dark:to-indigo-900/10 border border-violet-200 dark:border-violet-800/50 hover:scale-105 transition-transform">
                <div className="text-center">
                  <div className="text-lg mb-1">📅</div>
                  <div className="font-medium text-violet-700 dark:text-violet-300">Mensal</div>
                </div>
              </Link>
              <Link href="/reports?type=goals" className="p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 border border-emerald-200 dark:border-emerald-800/50 hover:scale-105 transition-transform">
                <div className="text-center">
                  <div className="text-lg mb-1">🎯</div>
                  <div className="font-medium text-emerald-700 dark:text-emerald-300">Caixinhas</div>
                </div>
              </Link>
              <Link href="/reports?type=performance" className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 border border-blue-200 dark:border-blue-800/50 hover:scale-105 transition-transform">
                <div className="text-center">
                  <TrendingUp className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                  <div className="font-medium text-blue-700 dark:text-blue-300">Performance</div>
                </div>
              </Link>
              <Link href="/reports?type=insights" className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800/50 hover:scale-105 transition-transform">
                <div className="text-center">
                  <div className="text-lg mb-1">💡</div>
                  <div className="font-medium text-amber-700 dark:text-amber-300">Insights</div>
                </div>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}