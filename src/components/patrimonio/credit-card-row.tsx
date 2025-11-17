'use client';

import Image from 'next/image';
import { CreditCard } from 'lucide-react';
import type { Account } from '@/lib/definitions';
import { AnimatedCounter } from '@/components/ui/animated-counter';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface CreditCardRowProps {
  card: Account;
}

export function CreditCardRow({ card }: CreditCardRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/50">
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-muted flex items-center justify-center h-10 w-10 overflow-hidden">
          {card.logoUrl ? <Image src={card.logoUrl} alt={card.bank} width={40} height={40} className="h-full w-full object-cover rounded-full" /> : <CreditCard className="h-5 w-5 text-muted-foreground" />}
        </div>
        <div>
          <p className="font-medium">{card.name}</p>
          <p className="text-xs text-muted-foreground">{card.bank}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-lg"><AnimatedCounter value={card.creditLimit || 0} formatter={formatCurrency} /></p>
        <p className="text-xs text-muted-foreground">Limite Total</p>
      </div>
    </div>
  );
}
