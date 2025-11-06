'use client';

import Link from 'next/link';
import { useState } from 'react';
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

type NetWorthSummaryProps = {
  liquidAssets: number;
  investedAssets: number;
};

export default function NetWorthSummary({
  liquidAssets,
  investedAssets,
}: NetWorthSummaryProps) {
  const [isPrivate, setIsPrivate] = useState(true);
  const totalNetWorth = liquidAssets + investedAssets;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const PrivacyBlur = () => <span className="text-xl font-bold">R$ ••••••</span>;
  const PrivacyBlurPrimary = () => <span className="text-2xl font-bold text-primary">R$ ••••••</span>;


  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-headline">
              Resumo do Patrimônio
            </CardTitle>
            <CardDescription>O pulso da sua vida financeira.</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPrivate(!isPrivate)}
            aria-label={isPrivate ? 'Mostrar valores' : 'Ocultar valores'}
          >
            {isPrivate ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Link
          href="/patrimonio"
          className="block rounded-lg bg-primary/5 p-4 transition-colors hover:bg-primary/10 mb-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Patrimônio Total</p>
            <div className="text-2xl font-bold text-primary">
              {isPrivate ? <PrivacyBlurPrimary /> : <AnimatedCounter value={totalNetWorth} formatter={formatCurrency} />}
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Clique para ver o detalhamento completo.
          </p>
        </Link>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-4 rounded-lg border p-4">
            <div className="rounded-full bg-blue-500/10 p-3">
              <Wallet className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Disponível Agora</p>
              {isPrivate ? <PrivacyBlur /> : <p className="text-xl font-bold"><AnimatedCounter value={liquidAssets} formatter={formatCurrency} /></p>}
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg border p-4">
            <div className="rounded-full bg-green-500/10 p-3">
              <PiggyBank className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Investido p/ Sonhos
              </p>
               {isPrivate ? <PrivacyBlur /> : <p className="text-xl font-bold"><AnimatedCounter value={investedAssets} formatter={formatCurrency} /></p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
