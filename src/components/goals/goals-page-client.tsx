
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { GoalList } from '@/components/goals/goal-list';
import { toggleFeaturedGoalAction } from '@/app/goals/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
  ownerId: string;
  ownerType: 'user' | 'vault';
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
  const [goals, setGoals] = useState(initialGoals);

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

  const handleGoToVault = (vaultId: string) => {
    document.cookie = `CAIXINHAS_VAULT_ID=${vaultId}; path=/`;
    window.location.href = '/';
  };

  return (
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
          onToggleFeatured={toggleFeatured}
          onGoToVault={handleGoToVault}
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
  );
}
