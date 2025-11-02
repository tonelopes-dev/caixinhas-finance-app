'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/dashboard/header';
import BalanceSummary from '@/components/dashboard/balance-summary';
import GoalBuckets from '@/components/dashboard/goal-buckets';
import RecentTransactions from '@/components/dashboard/recent-transactions';
import BudgetAnalysis from '@/components/dashboard/budget-analysis';
import { goals as allGoals, transactions as allTransactions, users, vaults, getMockDataForUser } from '@/lib/data';
import { AnimatedDiv } from '@/components/ui/animated-div';
import { PwaPrompt } from '@/components/pwa-prompt';
import { MotivationalNudge } from '@/components/dashboard/motivational-nudge';
import withAuth from '@/components/auth/with-auth';
import type { Goal, Transaction, Vault, User, Partner } from '@/lib/definitions';

function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPartner, setCurrentPartner] = useState<Partner | null>(null);
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  
  useEffect(() => {
    const vaultId = sessionStorage.getItem('DREAMVAULT_VAULT_ID');
    const userId = localStorage.getItem('DREAMVAULT_USER_ID');
    
    if (!userId) {
        router.push('/login');
        return;
    }

    const { currentUser: userFromMock, userVaults } = getMockDataForUser(userId);
    
    if (userFromMock) {
        setCurrentUser(userFromMock);
        const partnerUser = users.find(u => u.id !== userId && userVaults.some(uv => uv.members.some(m => m.id === u.id)));
        if (partnerUser) {
            setCurrentPartner(partnerUser);
        }
    }

    if (!vaultId) {
      router.push('/vaults');
    } else {
      const vault = vaults.find(v => v.id === vaultId);
      if (vault) {
        setSelectedVault(vault);
        setTransactions(allTransactions.filter(t => t.vaultId === vaultId));
        
        // Corrected goal filtering logic
        const vaultGoals = allGoals.filter(g => g.vaultId === vaultId);
        const accessibleGoals = vaultGoals.filter(g => {
            if (g.visibility === 'shared') {
                return true; // Visible to all vault members
            }
            if (g.visibility === 'private') {
                // Only visible if the current user is a participant
                return g.participants?.some(p => p.id === userId);
            }
            return false;
        });
        setGoals(accessibleGoals);

      } else {
        router.push('/vaults');
      }
    }
  }, [router]);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const almostThereGoal = goals.find(g => (g.currentAmount / g.targetAmount) >= 0.95 && (g.currentAmount / g.targetAmount) < 1);

  if (!selectedVault || !currentUser || !currentPartner) {
     return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header user={currentUser} partner={currentPartner} />
      <main className="flex-1 p-4 md:p-8 lg:p-10">
        <div className="mx-auto grid w-full max-w-7xl gap-8">
          <AnimatedDiv>
            <div className="flex flex-col gap-2">
              <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
                Painel de Controle: <span className="text-primary">{selectedVault.name}</span>
              </h1>
              <p className="text-muted-foreground font-headline">
                “Sonhar juntos é o primeiro passo para conquistar.”
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
                <BalanceSummary
                  income={totalIncome}
                  expenses={totalExpenses}
                />
              </AnimatedDiv>
              <AnimatedDiv transition={{ delay: 0.2 }}>
                <RecentTransactions transactions={transactions} />
              </AnimatedDiv>
            </div>
            <div className="grid auto-rows-max items-start gap-8">
              <AnimatedDiv transition={{ delay: 0.3 }}>
                <GoalBuckets goals={goals} />
              </AnimatedDiv>
              <AnimatedDiv transition={{ delay: 0.4 }}>
                <BudgetAnalysis 
                  goals={goals}
                  income={totalIncome}
                  expenses={expensesByCategory}
                />
              </AnimatedDiv>
            </div>
          </div>
        </div>
      </main>
      <PwaPrompt />
    </div>
  );
}

export default withAuth(HomePage);
