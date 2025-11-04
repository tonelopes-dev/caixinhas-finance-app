
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getMockDataForUser } from '@/lib/data';
import type { Account, Goal } from '@/lib/definitions';
import withAuth from '@/components/auth/with-auth';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PatrimonySection } from '@/components/patrimonio/patrimony-section';
import { AccountRow } from '@/components/patrimonio/account-row';
import { GoalRow } from '@/components/patrimonio/goal-row';
import { CreditCardRow } from '@/components/patrimonio/credit-card-row';


function PatrimonioPage() {
    const router = useRouter();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const id = localStorage.getItem('DREAMVAULT_USER_ID');
        if (!id) {
            router.push('/login');
            return;
        }
        setUserId(id);
        // Fetch all goals and all accounts the user has access to, regardless of workspace.
        const { userAccounts, userGoals } = getMockDataForUser(id, null, true);
        setAccounts(userAccounts);
        setGoals(userGoals);

    }, [router]);

    const liquidAssets = accounts.filter(a => ['checking', 'savings'].includes(a.type));
    const investedAccounts = accounts.filter(a => a.type === 'investment');
    const creditCards = accounts.filter(a => a.type === 'credit_card');

    const totalLiquid = liquidAssets.reduce((sum, acc) => sum + acc.balance, 0);
    const totalInvestedAccounts = investedAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalInGoals = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const totalInvested = totalInvestedAccounts + totalInGoals;

  if (!userId) {
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
              Meu Patrimônio Total
            </CardTitle>
            <CardDescription>
              Uma visão consolidada de todos os seus ativos, incluindo contas pessoais e participações em cofres.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8">
            <PatrimonySection title="Disponível Agora (Ativos Líquidos)" total={totalLiquid}>
              {liquidAssets.length > 0 ? liquidAssets.map(account => (
                <AccountRow key={account.id} account={account} />
              )) : <p className="text-muted-foreground text-sm px-3">Nenhuma conta corrente ou poupança cadastrada.</p>}
            </PatrimonySection>

            <PatrimonySection title="Investido p/ Sonhos" total={totalInvested}>
               {investedAccounts.length > 0 && (
                <>
                    <h4 className="font-semibold text-muted-foreground mb-2 px-3">Contas de Investimento</h4>
                    {investedAccounts.map(account => (
                      <AccountRow key={account.id} account={account} />
                    ))}
                </>
               )}

                <h4 className="font-semibold text-muted-foreground mt-4 mb-2 px-3">Caixinhas de Sonhos</h4>
                 {goals.length > 0 ? goals.map(goal => (
                    <GoalRow key={goal.id} goal={goal} />
              )) : <p className="text-muted-foreground text-sm px-3">Nenhuma caixinha criada neste espaço.</p>}
            </PatrimonySection>

            <PatrimonySection title="Crédito Disponível">
              {creditCards.length > 0 ? creditCards.map(card => (
                <CreditCardRow key={card.id} card={card} />
              )) : <p className="text-muted-foreground text-sm px-3">Nenhum cartão de crédito cadastrado.</p>}
            </PatrimonySection>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(PatrimonioPage);
