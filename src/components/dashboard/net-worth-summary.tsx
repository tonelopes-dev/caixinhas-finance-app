'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Wallet, PiggyBank, Eye, EyeOff } from 'lucide-react';
import { AnimatedCounter } from '../ui/animated-counter';
import { Button } from '../ui/button';
import { usePrivacyMode } from '@/hooks/use-privacy-mode';
import { motion } from 'framer-motion';

type NetWorthSummaryProps = {
  liquidAssets: number;
  investedAssets: number;
};

export default function NetWorthSummary({
  liquidAssets,
  investedAssets,
}: NetWorthSummaryProps) {
  const { isPrivate, togglePrivacy, isLoaded } = usePrivacyMode();
  const totalNetWorth = liquidAssets + investedAssets;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const PrivacyBlur = () => <span className="text-3xl font-black tracking-tighter text-[#2D241E]/30">R$ ••••••</span>;
  const PrivacyBlurPrimary = () => <span className="text-4xl font-black text-[#ff6b7b]/30 tracking-tighter">R$ ••••••</span>;


  return (
    <Card className="border-none bg-white shadow-[0_20px_50px_rgba(45,36,30,0.08)] rounded-[32px] overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="font-headline text-3xl font-bold tracking-tight text-[#2D241E]">
              Meu Patrimônio
            </CardTitle>
            <CardDescription className="text-base font-medium text-[#2D241E]/50">
                Todo o seu dinheiro somado em um só lugar.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePrivacy}
            aria-label={isPrivate ? 'Mostrar valores' : 'Ocultar valores'}
            disabled={!isLoaded}
          >
            {isPrivate ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Link
          href="/patrimonio"
          className="relative group block rounded-3xl bg-[#f6f3f1] p-8 transition-all duration-300 hover:shadow-inner border border-[#2D241E]/5 mb-8 overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <p className="text-sm font-bold tracking-widest text-[#ff6b7b] uppercase">Patrimônio Total</p>
              <p className="text-xs text-[#2D241E]/40 font-bold uppercase">Clique para ver detalhes</p>
            </div>
            <div className="text-5xl font-black tracking-tighter text-[#2D241E]">
              {!isLoaded || isPrivate ? <PrivacyBlurPrimary /> : <AnimatedCounter value={totalNetWorth} formatter={formatCurrency} />}
            </div>
          </div>
        </Link>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="relative group flex items-center gap-6 rounded-[28px] bg-white border-2 border-[#f6f3f1] p-6 transition-all duration-300 hover:border-[#ff6b7b]/20 hover:shadow-lg">
            <div className="rounded-2xl bg-blue-50 p-5">
              <Wallet className="h-10 w-10 text-blue-600" strokeWidth={2.5} />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-[#2D241E]/40 uppercase tracking-widest italic">dinheiro na mão</p>
              {!isLoaded || isPrivate ? <PrivacyBlur /> : <p className="text-3xl font-extrabold tracking-tighter text-[#2D241E]"><AnimatedCounter value={liquidAssets} formatter={formatCurrency} /></p>}
            </div>
          </div>

          <div className="relative group flex items-center gap-6 rounded-[28px] bg-white border-2 border-[#f6f3f1] p-6 transition-all duration-300 hover:border-[#456534]/20 hover:shadow-lg">
            <div className="rounded-2xl bg-emerald-50 p-5">
              <PiggyBank className="h-10 w-10 text-emerald-600" strokeWidth={2.5} />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-[#2D241E]/40 uppercase tracking-widest italic">nas caixinhas</p>
               {!isLoaded || isPrivate ? <PrivacyBlur /> : <p className="text-3xl font-extrabold tracking-tighter text-[#2D241E]"><AnimatedCounter value={investedAssets} formatter={formatCurrency} /></p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
