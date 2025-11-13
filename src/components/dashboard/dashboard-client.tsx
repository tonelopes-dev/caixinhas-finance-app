
'use client';

import { useState } from 'react';
import Header from '@/components/dashboard/header';
import GoalBuckets from '@/components/dashboard/goal-buckets';
import RecentTransactions from '@/components/dashboard/recent-transactions';
import { AnimatedDiv } from '@/components/ui/animated-div';
import { PwaPrompt } from '@/components/pwa-prompt';
import { MotivationalNudge } from '@/components/dashboard/motivational-nudge';
import NetWorthSummary from '@/components/dashboard/net-worth-summary';
import type { User, Account, Goal, Transaction } from '@/lib/definitions';

type DashboardClientProps = {
  currentUser: User;
  partner: User | null;
  workspaceId: string;
  workspaceName: string;
  isPersonalWorkspace: boolean;
  accounts: Account[];
  goals: Goal[];
  transactions: Transaction[];
};

export function DashboardClient({
  currentUser,
  partner,
  workspaceId,
  workspaceName,
  isPersonalWorkspace,
  accounts,
  goals,
  transactions,
}: DashboardClientProps) {
  const [transactionFilter, setTransactionFilter] = useState<
    'all' | 'income' | 'expense' | 'transfer'
  >('all');

  const liquidAssets = accounts
    .filter((a) => a.type === 'checking' || a.type === 'savings')
    .reduce((sum, a) => sum + a.balance, 0);

  const investedAssets = accounts
    .filter((a) => a.type === 'investment')
    .reduce((sum, a) => sum + a.balance, 0);

  const goalAssets = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  const almostThereGoal = goals.find(
    (g) =>
      g.currentAmount / g.targetAmount >= 0.95 &&
      g.currentAmount / g.targetAmount < 1
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header user={currentUser} partner={partner} />
      <main className="flex-1 p-4 md:p-8 lg:p-10">
        <div className="mx-auto grid w-full max-w-7xl gap-8">
          <AnimatedDiv>
            <div className="flex flex-col gap-2">
              <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
                Painel: <span className="text-primary">{workspaceName}</span>
              </h1>
              <p className="text-muted-foreground font-headline">
                {isPersonalWorkspace
                  ? 'Seu centro de comando financeiro pessoal.'
                  : '"Sonhar juntos é o primeiro passo para conquistar."'}
              </p>
            </div>
          </AnimatedDiv>
          {almostThereGoal && (
            <AnimatedDiv transition={{ delay: 0.5 }}>
              <MotivationalNudge goal={almostThereGoal} />
            </AnimatedDiv>
          )}
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="grid auto-rows-max items-start gap-8 lg:col-span-2">
              <AnimatedDiv transition={{ delay: 0.1 }}>
                <NetWorthSummary
                  liquidAssets={liquidAssets}
                  investedAssets={investedAssets + goalAssets}
                />
              </AnimatedDiv>
              <AnimatedDiv transition={{ delay: 0.2 }}>
                <RecentTransactions
                  transactions={transactions}
                  accounts={accounts}
                  goals={goals}
                  ownerId={workspaceId}
                  ownerType={isPersonalWorkspace ? 'user' : 'vault'}
                  typeFilter={transactionFilter}
                  onFilterChange={setTransactionFilter}
                />
              </AnimatedDiv>
            </div>
            <div className="grid auto-rows-max items-start gap-8">
              <AnimatedDiv transition={{ delay: 0.3 }}>
                <GoalBuckets goals={goals} workspaceName={workspaceName} />
              </AnimatedDiv>
            </div>
          </div>
        </div>
      </main>
      <PwaPrompt />
    </div>
  );
}
