'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Landmark, PiggyBank, CreditCard, Wallet, TrendingUp } from 'lucide-react';
import { getMockDataForUser } from '@/lib/data';
import type { Account, Goal } from '@/lib/definitions';
import withAuth from '@/components/auth/with-auth';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import Image from 'next/image';

const accountTypeDetails: Record<Account['type'], { label: string, icon: React.ElementType }> = {
    checking: { label: 'Conta Corrente', icon: Wallet },
    savings: { label: 'Poupança', icon: Wallet },
    investment: { label: 'Investimento', icon: TrendingUp },
    credit_card: { label: 'Cartão de Crédito', icon: CreditCard },
    other: { label: 'Outro', icon: Wallet },
};

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function PatrimonioPage() {
    const router = useRouter();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [workspaceName, setWorkspaceName] = useState('');

    useEffect(() => {
        const userId = localStorage.getItem('DREAMVAULT_USER_ID');
        const workspaceId = sessionStorage.getItem('DREAMVAULT_VAULT_ID');

        if (!userId || !workspaceId) {
            router.push('/login');
            return;
        }

        const { userAccounts, userGoals, userVaults } = getMockDataForUser(userId);
        
        const currentWorkspace = userVaults.find(v => v.id === workspaceId);
        setWorkspaceName(currentWorkspace ? currentWorkspace.name : "Minha Conta Pessoal");

        setAccounts(userAccounts.filter(a => a.ownerId === workspaceId));
        setGoals(userGoals.filter(g => g.ownerId === workspaceId));

    }, [router]);

    const liquidAssets = accounts.filter(a => ['checking', 'savings'].includes(a.type));
    const investedAccounts = accounts.filter(a => a.type === 'investment');
    const creditCards = accounts.filter(a => a.type === 'credit_card');

    const totalLiquid = liquidAssets.reduce((sum, acc) => sum + acc.balance, 0);
    const totalInvestedAccounts = investedAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalInGoals = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);

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
              Patrimônio de <span className="text-primary">{workspaceName}</span>
            </CardTitle>
            <CardDescription>
              Uma visão detalhada e organizada de todos os seus ativos financeiros e fontes de crédito.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8">
            {/* Ativos Líquidos */}
            <section>
              <h3 className="font-headline text-xl font-semibold mb-4 border-b pb-2">Disponível Agora (Ativos Líquidos)</h3>
              {liquidAssets.length > 0 ? liquidAssets.map(account => (
                <div key={account.id} className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-muted p-2 flex items-center justify-center h-10 w-10">
                        {account.logoUrl ? <Image src={account.logoUrl} alt={account.bank} width={28} height={28} className="h-7 w-7 object-contain" /> : <Landmark className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-xs text-muted-foreground">{account.bank} • {accountTypeDetails[account.type].label}</p>
                    </div>
                  </div>
                  <p className="font-medium text-lg"><AnimatedCounter value={account.balance} formatter={formatCurrency} /></p>
                </div>
              )) : <p className="text-muted-foreground text-sm px-3">Nenhuma conta corrente ou poupança cadastrada.</p>}
               <div className="flex justify-end font-bold text-lg mt-2 pr-3">
                Total: <span className="ml-2 text-primary"><AnimatedCounter value={totalLiquid} formatter={formatCurrency} /></span>
              </div>
            </section>

            {/* Ativos Investidos */}
            <section>
              <h3 className="font-headline text-xl font-semibold mb-4 border-b pb-2">Investido p/ Sonhos</h3>
               {investedAccounts.length > 0 && (
                <>
                    <h4 className="font-semibold text-muted-foreground mb-2 px-3">Contas de Investimento</h4>
                    {investedAccounts.map(account => (
                        <div key={account.id} className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/50">
                        <div className="flex items-center gap-4">
                           <div className="rounded-full bg-muted p-2 flex items-center justify-center h-10 w-10">
                                {account.logoUrl ? <Image src={account.logoUrl} alt={account.bank} width={28} height={28} className="h-7 w-7 object-contain" /> : <TrendingUp className="h-5 w-5 text-muted-foreground" />}
                           </div>
                            <div>
                                <p className="font-medium">{account.name}</p>
                                <p className="text-xs text-muted-foreground">{account.bank}</p>
                            </div>
                        </div>
                         <p className="font-medium text-lg"><AnimatedCounter value={account.balance} formatter={formatCurrency} /></p>
                        </div>
                    ))}
                </>
               )}

                <h4 className="font-semibold text-muted-foreground mt-4 mb-2 px-3">Caixinhas de Sonhos</h4>
                 {goals.length > 0 ? goals.map(goal => (
                <Link key={goal.id} href={`/goals/${goal.id}`} className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                     <div className="text-3xl">{goal.emoji}</div>
                    <div>
                      <p className="font-medium">{goal.name}</p>
                      <p className="text-xs text-muted-foreground">Meta: {formatCurrency(goal.targetAmount)}</p>
                    </div>
                  </div>
                  <p className="font-medium text-lg"><AnimatedCounter value={goal.currentAmount} formatter={formatCurrency} /></p>
                </Link>
              )) : <p className="text-muted-foreground text-sm px-3">Nenhuma caixinha criada neste espaço.</p>}
              <div className="flex justify-end font-bold text-lg mt-2 pr-3">
                Total: <span className="ml-2 text-primary"><AnimatedCounter value={totalInvestedAccounts + totalInGoals} formatter={formatCurrency} /></span>
              </div>
            </section>

             {/* Crédito */}
            <section>
              <h3 className="font-headline text-xl font-semibold mb-4 border-b pb-2">Crédito Disponível</h3>
              {creditCards.length > 0 ? creditCards.map(card => (
                <div key={card.id} className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                     <div className="rounded-full bg-muted p-2 flex items-center justify-center h-10 w-10">
                        {card.logoUrl ? <Image src={card.logoUrl} alt={card.bank} width={28} height={28} className="h-7 w-7 object-contain" /> : <CreditCard className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="font-medium">{card.name}</p>
                      <p className="text-xs text-muted-foreground">{card.bank}</p>
                    </div>
                  </div>
                   <div className="text-right">
                        <p className="font-medium text-lg"><AnimatedCounter value={card.creditLimit || 0} formatter={formatCurrency} /></p>
                        <p className="text-xs text-muted-foreground">Limite Total</p>
                   </div>
                </div>
              )) : <p className="text-muted-foreground text-sm px-3">Nenhum cartão de crédito cadastrado.</p>}
            </section>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(PatrimonioPage);
