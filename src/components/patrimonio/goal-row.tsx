
'use client';

import Link from 'next/link';
import type { Goal } from '@/lib/definitions';
import { AnimatedCounter } from '@/components/ui/animated-counter';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface GoalRowProps {
  goal: Goal;
}

export function GoalRow({ goal }: GoalRowProps) {
  return (
    <Link href={`/goals/${goal.id}`} className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/50">
      <div className="flex items-center gap-4">
        <div className="text-3xl">{goal.emoji}</div>
        <div>
          <p className="font-medium">{goal.name}</p>
          <p className="text-xs text-muted-foreground">Meta: {formatCurrency(goal.targetAmount)}</p>
        </div>
      </div>
      <p className="font-medium text-lg"><AnimatedCounter value={goal.currentAmount} formatter={formatCurrency} /></p>
    </Link>
  );
}
