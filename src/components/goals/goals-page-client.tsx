
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
          <div className="flex flex-col items-center justify-center py-24 px-4 bg-white/40 backdrop-blur-sm rounded-[40px] border border-white/50 shadow-xl text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <PlusCircle className="w-10 h-10 text-primary opacity-40" />
            </div>
            <h3 className="font-headline text-3xl font-bold text-[#2D241E] mb-2">Sem metas ainda?</h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-md">
              Não deixe seus sonhos apenas no papel. Comece a poupar agora mesmo criando sua primeira caixinha!
            </p>
            <Link href="/goals/new">
              <Button 
                className="h-14 px-10 rounded-[20px] font-black bg-[#ff6b7b] hover:bg-[#fa8292] text-white shadow-lg shadow-[#ff6b7b]/30 active:scale-95 transition-all text-base uppercase tracking-widest"
              >
                <PlusCircle className="mr-2 h-6 w-6" />
                Criar Primeira Caixinha
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            <AnimatedDiv transition={{ delay: 0.1 }}>
              <GoalList
                goals={goals as any}
                userVaults={vaults as any}
                userId={userId}
                onToggleFeatured={toggleFeatured}
                onGoToWorkspace={handleGoToWorkspace}
              />
            </AnimatedDiv>
            
            <AnimatedDiv transition={{ delay: 0.2 }} className="flex justify-center">
              <Link href="/goals/new" className="w-full max-w-md">
                <Button 
                  className="w-full h-14 rounded-[20px] font-black bg-[#ff6b7b] hover:bg-[#fa8292] text-white shadow-lg shadow-[#ff6b7b]/30 active:scale-95 transition-all text-base uppercase tracking-widest"
                >
                  <PlusCircle className="mr-2 h-6 w-6" />
                  Criar Nova Caixinha
                </Button>
              </Link>
            </AnimatedDiv>
          </div>
        )}
      </AnimatedDiv>
    </>
  );
}
