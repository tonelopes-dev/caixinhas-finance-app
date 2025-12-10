
'use client';

import type { Goal, Vault } from '@/lib/definitions';
import { GoalCard } from './goal-card';

interface GoalListProps {
  goals: Goal[];
  userVaults: Vault[];
  userId: string;
  onToggleFeatured: (goalId: string) => void;
  onGoToWorkspace: (workspaceId: string) => void;
}

export function GoalList({
  goals,
  userVaults,
  userId,
  onToggleFeatured,
  onGoToWorkspace,
}: GoalListProps) {
  
  if (!Array.isArray(goals) || goals.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed shadow-sm p-8 mt-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold tracking-tight">Nenhuma meta encontrada</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Parece que algo correu mal ou ainda não foram criadas metas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 auto-rows-fr">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          userVaults={userVaults}
          userId={userId}
          onToggleFeatured={onToggleFeatured}
          onGoToWorkspace={onGoToWorkspace}
        />
      ))}
    </div>
  );
}
