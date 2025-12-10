'use client';

import { Vault, Home, ArrowLeft, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function VaultsNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-0 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-6 relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 mx-auto">
              <Vault className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 opacity-80 animate-pulse"></div>
          </div>
          
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Workspace não encontrado
          </CardTitle>
          <CardDescription className="text-base mt-3">
            O workspace que você está procurando não existe, foi removido ou você não tem acesso a ele.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Código de erro temático */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-xl p-6 text-center border border-indigo-200 dark:border-indigo-800/50">
            <div className="text-4xl mb-2">🗄️</div>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              Workspace inacessível
            </span>
            <p className="text-sm text-muted-foreground mt-2">
              ID do workspace inválido ou sem permissão
            </p>
          </div>

          {/* Sugestões específicas */}
          <div className="bg-rose-50 dark:bg-rose-900/10 rounded-lg p-4 border border-rose-200 dark:border-rose-800/50">
            <h3 className="font-semibold text-rose-900 dark:text-rose-100 mb-2 text-sm">
              🚫 Possíveis causas:
            </h3>
            <ul className="text-sm text-rose-700 dark:text-rose-300 space-y-1">
              <li>• Você foi removido do workspace</li>
              <li>• O workspace foi excluído pelo proprietário</li>
              <li>• O convite expirou ou foi revogado</li>
              <li>• Você não tem permissão para acessar</li>
            </ul>
          </div>

          {/* Botões de ação */}
          <div className="space-y-3">
            <Button
              onClick={() => router.back()}
              variant="default"
              className="w-full h-12 text-base font-medium bg-indigo-600 hover:bg-indigo-700"
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
                <Link href="/vaults">
                  <Vault className="mr-2 h-4 w-4" />
                  Meus Workspaces
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-12"
              >
                <Link href="/vaults/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Workspace
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

          {/* Opções de workspace */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Opções disponíveis:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link href="/invitations" className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800/50 hover:scale-105 transition-transform">
                <div className="text-center">
                  <Users className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                  <div className="font-medium text-blue-700 dark:text-blue-300">Convites</div>
                </div>
              </Link>
              <Link href="/vaults?filter=shared" className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800/50 hover:scale-105 transition-transform">
                <div className="text-center">
                  <Vault className="h-4 w-4 mx-auto mb-1 text-green-600" />
                  <div className="font-medium text-green-700 dark:text-green-300">Compartilhados</div>
                </div>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}