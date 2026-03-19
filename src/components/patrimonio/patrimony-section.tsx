
'use client';

import React from 'react';
import { AnimatedCounter } from '@/components/ui/animated-counter';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface PatrimonySectionProps {
  title: string;
  total?: number;
  children: React.ReactNode;
}

export function PatrimonySection({ title, total, children }: PatrimonySectionProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#2D241E]/5 pb-4">
        <h3 className="font-headline text-2xl font-bold text-[#2D241E] italic">{title}</h3>
        {total !== undefined && (
          <div className="px-4 py-1.5 rounded-full bg-white/50 border border-[#2D241E]/5 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40 mr-2">Subtotal:</span>
            <span className="text-sm font-bold text-[#ff6b7b]">
              <AnimatedCounter value={total} formatter={formatCurrency} />
            </span>
          </div>
        )}
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </section>
  );
}
