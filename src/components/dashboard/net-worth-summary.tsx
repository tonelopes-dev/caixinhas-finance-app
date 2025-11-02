'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wallet, TrendingUp, PiggyBank } from 'lucide-react';
import { AnimatedCounter } from '../ui/animated-counter';

type NetWorthSummaryProps = {
  liquidAssets: number;
  investedAssets: number;
};

export default function NetWorthSummary({ liquidAssets, investedAssets }: NetWorthSummaryProps) {
  const totalNetWorth = liquidAssets + investedAssets;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Resumo do Patrimônio</CardTitle>
        <CardDescription>O pulso da sua vida financeira.</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/patrimonio" className="block p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors mb-4">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Patrimônio Total</p>
              <div className="text-2xl font-bold text-primary">
                <AnimatedCounter value={totalNetWorth} formatter={formatCurrency} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Clique para ver o detalhamento completo.</p>
        </Link>
        <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-4 rounded-lg border p-4">
                 <div className="rounded-full bg-blue-500/10 p-3">
                    <Wallet className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Disponível Agora</p>
                    <p className="text-xl font-bold"><AnimatedCounter value={liquidAssets} formatter={formatCurrency} /></p>
                </div>
            </div>
             <div className="flex items-center gap-4 rounded-lg border p-4">
                 <div className="rounded-full bg-green-500/10 p-3">
                    <PiggyBank className="h-6 w-6 text-green-500" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Investido p/ Sonhos</p>
                    <p className="text-xl font-bold"><AnimatedCounter value={investedAssets} formatter={formatCurrency} /></p>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
