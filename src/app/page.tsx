'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/dashboard/header';
import BalanceSummary from '@/components/dashboard/balance-summary';
import GoalBuckets from '@/components/dashboard/goal-buckets';
import RecentTransactions from '@/components/dashboard/recent-transactions';
import BudgetAnalysis from '@/components/dashboard/budget-analysis';
import { goals as allGoals, transactions as allTransactions, users, vaults, getMockDataForUser, accounts } from '@/lib/data';
import { AnimatedDiv } from '@/components/ui/animated-div';
import { PwaPrompt } from '@/components/pwa-prompt';
import { MotivationalNudge } from '@/components/dashboard/motivational-nudge';
import withAuth from '@/components/auth/with-auth';
import type { Goal, Transaction, Vault, User } from '@/lib/definitions';

function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<User | null>(null);
  
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string>('');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'income' | 'expense'>('all');
  
  useEffect(() => {
    const selectedWorkspaceId = sessionStorage.getItem('DREAMVAULT_VAULT_ID');
    const userId = localStorage.getItem('DREAMVAULT_USER_ID');
    
    if (!userId) {
        router.push('/login');
        return;
    }
    if (!selectedWorkspaceId) {
        router.push('/vaults');
        return;
    }

    const { currentUser: userFromMock } = getMockDataForUser(userId);
    if (userFromMock) {
        setCurrentUser(userFromMock);
    }
    
    setWorkspaceId(selectedWorkspaceId);

    // Determine if workspace is a personal account or a vault
    if (selectedWorkspaceId === userId) {
        // It's the user's personal account
        const { userTransactions, userGoals } = getMockDataForUser(userId);
        setWorkspaceName("Minha Conta Pessoal");
        setTransactions(userTransactions);
        setGoals(userGoals.filter(g => g.ownerType === 'user'));
        setPartner(null); // No specific partner in personal view

    } else {
        // It's a vault
        const vault = vaults.find(v => v.id === selectedWorkspaceId);
        if (vault) {
            setWorkspaceName(vault.name);
            setTransactions(allTransactions.filter(t => t.ownerId === selectedWorkspaceId && t.ownerType === 'vault'));
            
            // Filter goals for the vault, respecting visibility
            const vaultGoals = allGoals.filter(g => g.ownerId === selectedWorkspaceId && g.ownerType === 'vault');
            setGoals(vaultGoals);

            // Set partner if it's a shared vault
            const otherMember = vault.members.find(m => m.id !== userId);
            if (otherMember) {
                setPartner(otherMember)
            } else {
                setPartner(null);
            }

        } else {
            console.error("Vault not found, redirecting.");
            router.push('/vaults'); // Redirect if vault ID is invalid
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

  if (!currentUser || !workspaceId) {
     return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

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
                {workspaceId === currentUser.id 
                    ? "Seu centro de comando financeiro pessoal."
                    : "“Sonhar juntos é o primeiro passo para conquistar.”"
                }
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
                  onFilterChange={setTransactionFilter}
                  activeFilter={transactionFilter}
                />
              </AnimatedDiv>
              <AnimatedDiv transition={{ delay: 0.2 }}>
                <RecentTransactions 
                    transactions={transactions} 
                    ownerId={workspaceId} 
                    ownerType={workspaceId === currentUser.id ? 'user' : 'vault'} 
                    typeFilter={transactionFilter}
                    onFilterChange={setTransactionFilter}
                />
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
