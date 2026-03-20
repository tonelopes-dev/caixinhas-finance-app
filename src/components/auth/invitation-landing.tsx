'use client';

import { VaultInvitationData } from '@/services/vault.service';
import { Logo } from '@/components/logo';
import { GradientButton } from '@/components/ui/gradient-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, Lock, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface InvitationLandingProps {
  invitation: VaultInvitationData;
}

export function InvitationLanding({ invitation }: InvitationLandingProps) {
  const senderName = invitation.sender.name;
  const vaultName = invitation.vault?.name || 'Cofre Compartilhado';
  const membersCount = invitation.vault?.members.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse delay-700" />
      
      <div className="w-full max-w-xl relative z-10">
        <Card className="border-2 border-primary/10 shadow-2xl backdrop-blur-xl bg-white/40 overflow-hidden rounded-[32px]">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary animate-shimmer" />
          
          <CardHeader className="text-center pt-12 pb-8">
            <div className="flex justify-center mb-8 relative">
              <div className="p-4 bg-white rounded-3xl shadow-xl border border-primary/10 relative z-10">
                <Logo className="h-16 w-16 animate-float-logo" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center animate-bounce shadow-lg border-2 border-white">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>

            <CardTitle className="text-4xl font-headline font-black italic tracking-tighter text-[#2D241E] mb-4">
              Você foi convidado!
            </CardTitle>
            
            <CardDescription className="text-lg font-medium text-[#2D241E]/70 max-w-[80%] mx-auto leading-relaxed">
               <span className="text-primary font-bold">{senderName}</span> quer que você ajude a poupar para o cofre <span className="text-[#2D241E] font-black underline decoration-accent/40 decoration-4 underline-offset-4">{vaultName}</span>.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-12 space-y-8">
            {/* Seção de Contexto do Cofre */}
            <div className="bg-white/60 rounded-3xl p-6 border border-white/80 shadow-inner flex items-center gap-6">
              <div className="flex -space-x-4">
                {invitation.vault?.members.slice(0, 3).map((member, i) => (
                  <Avatar key={i} className="border-4 border-white h-12 w-12 shadow-sm">
                    <AvatarImage src={member.user.avatarUrl || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {member.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {membersCount > 3 && (
                  <div className="h-12 w-12 rounded-full bg-accent/20 border-4 border-white flex items-center justify-center text-[10px] font-black text-accent shadow-sm">
                    +{membersCount - 3}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs font-black uppercase tracking-widest text-[#2D241E]/40 mb-1">Membros Ativos</p>
                <p className="text-sm font-bold text-[#2D241E]">{membersCount} pessoas poupando juntas</p>
              </div>
            </div>

            <div className="grid gap-4 pt-4">
              <Link href={`/register?invite=${invitation.id}&callbackUrl=/invitations`}>
                <GradientButton className="w-full h-16 text-lg group rounded-2xl shadow-xl shadow-primary/20">
                  <span className="flex items-center gap-2">
                    Aceitar Convite e Criar Conta
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </GradientButton>
              </Link>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#2D241E]/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest font-black">
                  <span className="bg-transparent px-2 text-[#2D241E]/30">Já tem uma conta?</span>
                </div>
              </div>

              <Link href={`/login?callbackUrl=/invitations`}>
                <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-primary/10 hover:bg-white hover:border-primary/30 text-[#2D241E] font-bold transition-all hover:shadow-lg">
                  Fazer Login para Entrar no Cofre
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-6 pt-6 grayscale opacity-40">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#2D241E]">
                <Lock className="h-3 w-3" />
                Seguro
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#2D241E]">
                <Users className="h-3 w-3" />
                Colaborativo
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center mt-8 text-xs font-medium text-[#2D241E]/40">
          Você está sendo convidado para uma plataforma de finanças colaborativas premium. <br />
          Saiba saber mais em <Link href="/landing" className="text-primary font-bold hover:underline">caixinhas.app</Link>
        </p>
      </div>
    </div>
  );
}
