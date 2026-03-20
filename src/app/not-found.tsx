'use client';

import { Home, ArrowLeft, Search, Compass, Sparkles, MoveRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use404Analytics, useCommon404Patterns } from '@/hooks/use-404-analytics';
import { Logo } from '@/components/logo';
import { motion } from 'framer-motion';

export default function NotFound() {
  const router = useRouter();
  const { suggestions } = use404Analytics();
  const { message } = useCommon404Patterns();

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
                <Compass className="h-6 w-6 text-white" />
              </div>
            </div>

            <CardTitle className="text-5xl font-headline font-black italic tracking-tighter text-[#2D241E] mb-6">
              Opa! Caminho errado?
            </CardTitle>
            
            <CardDescription className="text-xl font-medium text-[#2D241E]/60 max-w-[85%] mx-auto leading-relaxed">
              Não conseguimos encontrar a página que você procura. Parece que esse objetivo financeiro ainda não foi criado! 😉
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-10 pb-16 space-y-10">
            {/* 404 Display Premium */}
            <div className="relative py-12 flex items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-[#2D241E]/5 to-transparent border border-white/50 shadow-inner">
               <span className="text-8xl font-black text-[#2D241E]/10 tracking-[1.5rem] select-none">
                 404
               </span>
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-primary/10 shadow-lg">
                    <Sparkles className="h-4 w-4 text-accent animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-widest text-[#2D241E]">
                      Houve uma falha na matriz financeira
                    </span>
                 </div>
               </div>
            </div>

            {/* Pattern/Message (Contextual Info) */}
            {message && (
              <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-200/50 flex gap-4">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Search className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-amber-900/40 mb-1">Dica do Sistema</h3>
                  <p className="text-sm font-bold text-amber-900/70">{message}</p>
                </div>
              </div>
            )}

            {/* Sugestões Inteligentes */}
            {suggestions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-1 w-8 bg-primary rounded-full" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#2D241E]/40">Caminhos Sugeridos</h3>
                </div>
                <div className="grid gap-3">
                  {suggestions.map((suggestion) => (
                    <Link
                      key={suggestion.path}
                      href={suggestion.path}
                      className="group flex items-center justify-between p-5 rounded-2xl bg-white/60 hover:bg-white border border-primary/5 hover:border-primary/20 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors">
                           <MoveRight className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#2D241E]">{suggestion.label}</p>
                          <p className="text-xs font-medium text-[#2D241E]/40">{suggestion.description}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                         {Math.round(suggestion.confidence * 100)}% Match
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid gap-4 pt-6">
              <Link href="/dashboard">
                <GradientButton className="w-full h-16 text-lg group rounded-2xl shadow-xl shadow-primary/20">
                  <span className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Voltar ao Painel Principal
                  </span>
                </GradientButton>
              </Link>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="h-14 rounded-2xl border-2 border-primary/10 hover:border-primary/30 font-bold transition-all"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                <Link href="/vaults">
                  <Button
                    variant="outline"
                    className="w-full h-14 rounded-2xl border-2 border-primary/10 hover:border-primary/30 font-bold transition-all"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Ver Cofres
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links Rápidos Compactos */}
        <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-4">
           {['Cofres', 'Metas', 'Relatórios', 'Perfil'].map((link) => (
             <Link 
               key={link} 
               href={`/${link.toLowerCase().replace('é', 'e').replace('ô', 'o')}`}
               className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/30 hover:text-primary transition-colors"
             >
               {link}
             </Link>
           ))}
        </div>
      </div>
    </div>
  );
}