'use client';

import { Vault, Home, ArrowLeft, Plus, Users, Sparkles, MoveRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';

export default function VaultsNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse delay-700" />
      
      <div className="w-full max-w-2xl relative z-10">
        <Card className="border-2 border-primary/10 shadow-2xl backdrop-blur-xl bg-white/40 overflow-hidden rounded-[40px]">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary animate-shimmer" />
          
          <CardHeader className="text-center pt-16 pb-8">
            <div className="flex justify-center mb-10 relative">
              <div className="p-5 bg-white rounded-[32px] shadow-2xl border border-primary/10 relative z-10">
                <Logo className="h-20 w-20 animate-float-logo" />
              </div>
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-accent rounded-full flex items-center justify-center animate-bounce shadow-lg border-4 border-white">
                <Vault className="h-6 w-6 text-white" />
              </div>
            </div>

            <CardTitle className="text-5xl font-headline font-black italic tracking-tighter text-[#2D241E] mb-6">
              Workspace Perdido?
            </CardTitle>
            
            <CardDescription className="text-xl font-medium text-[#2D241E]/60 max-w-[85%] mx-auto leading-relaxed">
              Não encontramos esse workspace. Ele pode ter sido removido, ou você ainda não faz parte dele.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-10 pb-16 space-y-10">
            {/* Context Card Premium */}
            <div className="bg-rose-50/60 rounded-3xl p-6 border border-rose-200/50 flex gap-6 items-center shadow-inner">
               <div className="h-16 w-16 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0 shadow-sm">
                  <div className="text-3xl">🚫</div>
               </div>
               <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-rose-900/40 mb-1">Status do Acesso</h3>
                  <p className="text-sm font-bold text-rose-900/70">ID inválido, workspace excluído ou permissão revogada.</p>
               </div>
            </div>

            {/* Sugestões de Ação */}
            <div className="grid grid-cols-2 gap-4">
              <Link href="/invitations" className="group p-5 rounded-2xl bg-white/60 hover:bg-white border border-primary/5 hover:border-primary/20 transition-all shadow-sm hover:shadow-md">
                 <Users className="h-5 w-5 text-primary mb-3" />
                 <p className="text-sm font-black text-[#2D241E]">Ver Convites</p>
                 <p className="text-[10px] font-medium text-[#2D241E]/40">Confira se há convites pendentes</p>
              </Link>
              <Link href="/vaults/new" className="group p-5 rounded-2xl bg-white/60 hover:bg-white border border-primary/5 hover:border-primary/20 transition-all shadow-sm hover:shadow-md">
                 <Plus className="h-5 w-5 text-accent mb-3" />
                 <p className="text-sm font-black text-[#2D241E]">Criar Novo</p>
                 <p className="text-[10px] font-medium text-[#2D241E]/40">Comece um novo workspace agora</p>
              </Link>
            </div>

            {/* Principal Action Buttons */}
            <div className="grid gap-4 pt-6">
              <Link href="/vaults">
                <GradientButton className="w-full h-16 text-lg group rounded-2xl shadow-xl shadow-primary/20">
                  <span className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Ir para Meus Workspaces
                  </span>
                </GradientButton>
              </Link>

              <Button
                onClick={() => router.back()}
                variant="outline"
                className="h-14 rounded-2xl border-2 border-primary/10 hover:border-primary/30 font-bold transition-all"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar à Página Anterior
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Humorous Footer */}
        <p className="text-center mt-8 text-xs font-medium text-[#2D241E]/30 italic">
          "O dinheiro não some, ele apenas muda de lugar... as URLs também." 💸
        </p>
      </div>
    </div>
  );
}