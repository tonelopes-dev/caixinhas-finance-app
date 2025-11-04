
'use client';

import Image from 'next/image';
import { Landmark, Wallet, TrendingUp } from 'lucide-react';
import type { Account } from '@/lib/definitions';
import { AnimatedCounter } from '@/components/ui/animated-counter';

const accountTypeDetails: Record<Account['type'], { label: string, icon: React.ElementType }> = {
    checking: { label: 'Conta Corrente', icon: Wallet },
    savings: { label: 'Poupança', icon: Wallet },
    investment: { label: 'Investimento', icon: TrendingUp },
    credit_card: { label: 'Cartão de Crédito', icon: Wallet }, // Should not be rendered here, but for safety
    other: { label: 'Outro', icon: Wallet },
};

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface AccountRowProps {
  account: Account;
}

export function AccountRow({ account }: AccountRowProps) {
  const Icon = accountTypeDetails[account.type]?.icon || Wallet;

  return (
    <div className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/50">
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-muted p-2 flex items-center justify-center h-10 w-10">
            {account.logoUrl ? <Image src={account.logoUrl} alt={account.bank} width={28} height={28} className="h-7 w-7 object-contain" /> : <Icon className="h-5 w-5 text-muted-foreground" />}
        </div>
        <div>
          <p className="font-medium">{account.name}</p>
          <p className="text-xs text-muted-foreground">{account.bank} • {accountTypeDetails[account.type].label}</p>
        </div>
      </div>
      <p className="font-medium text-lg"><AnimatedCounter value={account.balance} formatter={formatCurrency} /></p>
    </div>
  );
}
