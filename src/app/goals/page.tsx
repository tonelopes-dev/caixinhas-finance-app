'use client';

import Link from 'next/link';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { getMockDataForUser } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import withAuth from '@/components/auth/with-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Goal, Vault } from '@/lib/definitions';
import { GoalList } from '@/components/goals/goal-list';

function GoalsPage() {
  const router = useRouter();
  const [allGoals, setAllGoals] = useState<Goal[]>([]);
  const [userVaults, setUserVaults] = useState<Vault[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('CAIXINHAS_USER_ID');
    if (!userId) {
      router.push('/login');
      return;
    }
    setCurrentUserId(userId);

    const { userGoals, userVaults: vaultsForUser } = getMockDataForUser(
      userId,
      null,
      true
    );
    setAllGoals(userGoals);
    setUserVaults(vaultsForUser);
  }, [router]);

  const toggleFeatured = (goalId: string) => {
    setAllGoals((prevGoals) =>
      prevGoals.map((g) =>
        g.id === goalId ? { ...g, isFeatured: !g.isFeatured } : g
      )
    );
  };

  const handleGoToVault = (vaultId: string) => {
    sessionStorage.setItem('CAIXINHAS_VAULT_ID', vaultId);
    router.push('/');
  };

  if (!currentUserId) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Painel
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Todas as Suas Caixinhas
            </CardTitle>
            <CardDescription>
              Acompanhe e gerencie o progresso de todos os seus sonhos,
              pessoais e compartilhados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GoalList
              goals={allGoals}
              userVaults={userVaults}
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
      </div>
    </div>
  );
}

export default withAuth(GoalsPage);
