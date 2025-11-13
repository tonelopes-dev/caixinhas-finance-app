import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPatrimonyData } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PatrimonySection } from '@/components/patrimonio/patrimony-section';
import { AccountRow } from '@/components/patrimonio/account-row';
import { GoalRow } from '@/components/patrimonio/goal-row';
import { CreditCardRow } from '@/components/patrimonio/credit-card-row';

export default async function PatrimonioPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('CAIXINHAS_USER_ID')?.value;

  if (!userId) {
    redirect('/login');
  }

  const { accounts, goals, vaults } = await getPatrimonyData(userId);

  const liquidAssets = accounts.filter(a => ['checking', 'savings'].includes(a.type));
  const investedAccounts = accounts.filter(a => a.type === 'investment');
  const creditCards = accounts.filter(a => a.type === 'credit_card');

  const totalLiquid = liquidAssets.reduce((sum, acc) => sum + acc.balance, 0);
  const totalInvestedAccounts = investedAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalInGoals = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalInvested = totalInvestedAccounts + totalInGoals;

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/dashboard">
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
                <AccountRow key={account.id} account={account as any} />
              )) : <p className="text-muted-foreground text-sm px-3">Nenhuma conta corrente ou poupança cadastrada.</p>}
            </PatrimonySection>

            <PatrimonySection title="Investido p/ Sonhos" total={totalInvested}>
               {investedAccounts.length > 0 && (
                <>
                    <h4 className="font-semibold text-muted-foreground mb-2 px-3">Contas de Investimento</h4>
                    {investedAccounts.map(account => (
                      <AccountRow key={account.id} account={account as any} />
                    ))}
                </>
               )}

                <h4 className="font-semibold text-muted-foreground mt-4 mb-2 px-3">Caixinhas de Sonhos</h4>
                 {goals.length > 0 ? goals.map(goal => (
                    <GoalRow key={goal.id} goal={goal as any} vaults={vaults as any} />
              )) : <p className="text-muted-foreground text-sm px-3">Nenhuma caixinha criada neste espaço.</p>}
            </PatrimonySection>

            <PatrimonySection title="Crédito Disponível">
              {creditCards.length > 0 ? creditCards.map(card => (
                <CreditCardRow key={card.id} card={card as any} />
              )) : <p className="text-muted-foreground text-sm px-3">Nenhum cartão de crédito cadastrado.</p>}
            </PatrimonySection>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
