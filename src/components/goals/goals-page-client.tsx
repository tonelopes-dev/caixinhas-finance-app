
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
import { AnimatedDiv } from '@/components/ui/animated-div';
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
      
      <AnimatedDiv>
        {goals.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p className="mb-6">Parece que algo correu mal ou ainda não foram criadas metas.</p>
                <Button 
                  size="lg" 
                  className="transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] group shadow-lg"
                  asChild
                >
                  <Link href="/goals/new">
                    <PlusCircle className="mr-2 h-5 w-5 transition-transform duration-200 group-hover:rotate-90" />
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
              <AnimatedDiv transition={{ delay: 0.1 }}>
                <GoalList
                  goals={goals as any}
                  userVaults={vaults as any}
                  userId={userId}
                  onToggleFeatured={toggleFeatured}
                  onGoToWorkspace={handleGoToWorkspace}
                />
              </AnimatedDiv>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <AnimatedDiv transition={{ delay: 0.2 }}>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:scale-[1.02] active:scale-[0.98] group" 
                  asChild
                >
                  <Link href="/goals/new">
                    <PlusCircle className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
                    Criar Nova Caixinha
                  </Link>
                </Button>
              </AnimatedDiv>
            </CardFooter>
          </Card>
        )}
      </AnimatedDiv>
    </>
  );
}
