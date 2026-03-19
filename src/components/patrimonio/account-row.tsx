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
    <div className="flex items-center justify-between rounded-2xl p-4 bg-white/30 border border-white/40 hover:bg-white/50 hover:border-[#ff6b7b]/30 hover:shadow-lg hover:shadow-[#ff6b7b]/5 transition-all duration-300 group">
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-white p-0.5 shadow-sm border border-[#2D241E]/5 flex items-center justify-center h-12 w-12 overflow-hidden group-hover:scale-110 transition-transform duration-500">
          {account.logoUrl ? (
            <Image src={account.logoUrl} alt={account.bank} width={48} height={48} className="h-full w-full object-cover rounded-[10px]" />
          ) : (
            <div className="h-full w-full bg-[#ff6b7b]/5 flex items-center justify-center rounded-[10px]">
              <Icon className="h-6 w-6 text-[#ff6b7b]" />
            </div>
          )}
        </div>
        <div>
          <p className="font-bold text-[#2D241E] text-sm tracking-tight">{account.name}</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40">{account.bank}</span>
            <span className="h-1 w-1 rounded-full bg-[#2D241E]/10" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#ff6b7b]/60">{accountTypeDetails[account.type].label}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-[#2D241E] text-lg tracking-tighter">
          <AnimatedCounter value={account.balance} formatter={formatCurrency} />
        </p>
      </div>
    </div>
  );
}
