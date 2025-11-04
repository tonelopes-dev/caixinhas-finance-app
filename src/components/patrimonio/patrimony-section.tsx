
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
    <section>
      <h3 className="font-headline text-xl font-semibold mb-4 border-b pb-2">{title}</h3>
      {children}
      {total !== undefined && (
        <div className="flex justify-end font-bold text-lg mt-2 pr-3">
          Total: <span className="ml-2 text-primary"><AnimatedCounter value={total} formatter={formatCurrency} /></span>
        </div>
      )}
    </section>
  );
}
