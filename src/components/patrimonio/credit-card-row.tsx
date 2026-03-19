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
    <div className="flex items-center justify-between rounded-2xl p-4 bg-white/30 border border-white/40 hover:bg-white/50 hover:border-[#ff6b7b]/30 hover:shadow-lg hover:shadow-[#ff6b7b]/5 transition-all duration-300 group">
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-white p-0.5 shadow-sm border border-[#2D241E]/5 flex items-center justify-center h-12 w-12 overflow-hidden group-hover:scale-110 transition-transform duration-500">
          {card.logoUrl ? (
            <Image src={card.logoUrl} alt={card.bank} width={48} height={48} className="h-full w-full object-cover rounded-[10px]" />
          ) : (
            <div className="h-full w-full bg-[#ff6b7b]/5 flex items-center justify-center rounded-[10px]">
              <CreditCard className="h-6 w-6 text-[#ff6b7b]" />
            </div>
          )}
        </div>
        <div>
          <p className="font-bold text-[#2D241E] text-sm tracking-tight">{card.name}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40">{card.bank}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40 mb-0.5">Limite Total</p>
        <p className="font-bold text-[#2D241E] text-lg tracking-tighter line-through decoration-[#ff6b7b]/20">
          <AnimatedCounter value={card.creditLimit || 0} formatter={formatCurrency} />
        </p>
      </div>
    </div>
  );
}
