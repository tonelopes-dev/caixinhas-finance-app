
'use client';

import type { Goal, Vault } from '@/lib/definitions';
import { GoalCard } from './goal-card';

interface GoalListProps {
  goals: Goal[];
  userVaults: Vault[];
  onToggleFeatured: (goalId: string) => void;
  onGoToVault: (vaultId: string) => void;
}

export function GoalList({
  goals,
  userVaults,
  onToggleFeatured,
  onGoToVault,
}: GoalListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          userVaults={userVaults}
          onToggleFeatured={onToggleFeatured}
          onGoToVault={onGoToVault}
        />
      ))}
    </div>
  );
}
