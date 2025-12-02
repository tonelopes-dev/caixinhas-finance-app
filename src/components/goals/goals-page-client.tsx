
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { GoalList } from '@/components/goals/goal-list';
import { CompletedGoalsConfetti } from '@/components/goals/completed-goals-confetti';
import { toggleFeaturedGoalAction } from '@/app/(private)/goals/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

type Goal = {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  currentAmount: number;
  visibility: 'private' | 'shared';
  isFeatured: boolean;
  userId?: string | null;
  vaultId?: string | null;
  ownerId?: string; // Mantido para compatibilidade
  ownerType?: 'user' | 'vault'; // Mantido para compatibilidade
  participants: {
    id: string;
    name: string;
    avatarUrl: string;
    role: string;
  }[];
};

type Vault = {
  id: string;
  name: string;
  imageUrl: string;
  ownerId: string;
  members: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
  }[];
};

type GoalsPageClientProps = {
  goals: Goal[];
  vaults: Vault[];
  userId: string;
};

export function GoalsPageClient({ goals: initialGoals, vaults, userId }: GoalsPageClientProps) {
  const { toast } = useToast();
  const [goals, setGoals] = useState(initialGoals || []);

  // Calcula quantas metas estão completas (100% ou mais)
  const completedGoals = useMemo(() => {
    return goals.filter(goal => goal.currentAmount >= goal.targetAmount);
  }, [goals]);

  const completedGoalsCount = completedGoals.length;

  console.log('🎯 GoalsPageClient - Goals:', goals?.length, goals);
  console.log('🎯 GoalsPageClient - Completed Goals:', completedGoalsCount);
  console.log('🎯 GoalsPageClient - Vaults:', vaults?.length);
  console.log('🎯 GoalsPageClient - UserId:', userId);

  const toggleFeatured = async (goalId: string) => {
    // Atualização otimista
    setGoals((prevGoals: Goal[]) =>
      prevGoals.map((g: Goal) =>
        g.id === goalId ? { ...g, isFeatured: !g.isFeatured } : g
      )
    );

    const result = await toggleFeaturedGoalAction(goalId);

    if (!result.success) {
      // Reverter em caso de erro
      setGoals((prevGoals: Goal[]) =>
        prevGoals.map((g: Goal) =>
          g.id === goalId ? { ...g, isFeatured: !g.isFeatured } : g
        )
      );
      toast({
        title: 'Erro',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  const handleGoToWorkspace = (workspaceId: string) => {
    if (workspaceId === userId) {
      // Remove o cookie para voltar ao workspace pessoal
      document.cookie = 'CAIXINHAS_VAULT_ID=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } else {
      // Define o cookie para o ID do cofre
      document.cookie = `CAIXINHAS_VAULT_ID=${workspaceId}; path=/`;
    }
    window.location.href = '/';
  };

  if (!goals) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      {/* Confetes para metas completas */}
      <CompletedGoalsConfetti 
        completedGoals={completedGoals} 
        userId={userId} 
      />
      
    {goals.length === 0 ? (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p className="mb-4">Parece que algo correu mal ou ainda não foram criadas metas.</p>
            <Button asChild>
              <Link href="/goals/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar Primeira Caixinha
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    ) : (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            Todas as Suas Caixinhas
          </CardTitle>
          <CardDescription>
            Acompanhe, gerencie e favorite seus sonhos. As caixinhas favoritadas com um coração aparecerão em destaque no seu painel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoalList
            goals={goals as any}
            userVaults={vaults as any}
            userId={userId}
            onToggleFeatured={toggleFeatured}
            onGoToWorkspace={handleGoToWorkspace}
          />
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/goals/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar Nova Caixinha
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )}
    </>
  );
}
