
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
    <Link href={`/goals/${goal.id}`} className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/50">
      <div className="flex items-center gap-4">
        <div className="text-3xl">{goal.emoji}</div>
        <div>
          <p className="font-medium">{goal.name}</p>
          <div className="text-xs text-muted-foreground space-x-2">
            <span>Meta: {formatCurrency(goal.targetAmount)}</span>
            <span className='font-semibold'>•</span>
            <span>{ownerName}</span>
          </div>
        </div>
      </div>
      <p className="font-medium text-lg"><AnimatedCounter value={goal.currentAmount} formatter={formatCurrency} /></p>
    </Link>
  );
}
