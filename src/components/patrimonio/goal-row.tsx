
'use client';

import Link from 'next/link';
import type { Goal, Vault } from '@/lib/definitions';
import { AnimatedCounter } from '@/components/ui/animated-counter';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

interface GoalRowProps {
  goal: Goal;
  vaults: Vault[];
}

export function GoalRow({ goal, vaults }: GoalRowProps) {
  const owner = goal.ownerType === 'vault' 
    ? vaults.find(v => v.id === goal.ownerId) 
    : null;
  const ownerName = owner ? `Cofre: ${owner.name}` : 'Pessoal';

  return (
    <Link href={`/goals/${goal.id}`} className="flex items-center justify-between rounded-2xl p-4 bg-white/30 border border-white/40 hover:bg-white/50 hover:border-[#ff6b7b]/30 hover:shadow-lg hover:shadow-[#ff6b7b]/5 transition-all duration-300 group">
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-white shadow-sm border border-[#2D241E]/5 flex items-center justify-center h-12 w-12 group-hover:scale-110 transition-transform duration-500">
          <span className="text-2xl">{goal.emoji}</span>
        </div>
        <div>
          <p className="font-bold text-[#2D241E] text-sm tracking-tight">{goal.name}</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40">Meta: {formatCurrency(goal.targetAmount)}</span>
            <span className="h-1 w-1 rounded-full bg-[#2D241E]/10" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#ff6b7b]/60">{ownerName}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-[#2D241E] text-lg tracking-tighter">
          <AnimatedCounter value={goal.currentAmount} formatter={formatCurrency} />
        </p>
      </div>
    </Link>
  );
}
