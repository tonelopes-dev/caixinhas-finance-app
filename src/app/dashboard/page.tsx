
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/dashboard/header';
import GoalBuckets from '@/components/dashboard/goal-buckets';
import RecentTransactions from '@/components/dashboard/recent-transactions';
import { getMockDataForUser } from '@/lib/data';
import { AnimatedDiv } from '@/components/ui/animated-div';
import { PwaPrompt } from '@/components/pwa-prompt';
import { MotivationalNudge } from '@/components/dashboard/motivational-nudge';
import withAuth from '@/components/auth/with-auth';
import type { Goal, Transaction, Vault, User, Account } from '@/lib/definitions';
import NetWorthSummary from '@/components/dashboard/net-worth-summary';

function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<User | null>(null);
  
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string>('');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  
  useEffect(() => {
    const selectedWorkspaceId = sessionStorage.getItem('CAIXINHAS_VAULT_ID');
    const userId = localStorage.getItem('CAIXINHAS_USER_ID');
    
    if (!userId) {
        router.push('/login');
        return;
    }
    if (!selectedWorkspaceId) {
        router.push('/vaults');
        return;
    }

    // Centralized data fetching
    const { 
      currentUser: user, 
      userAccounts, 
      userTransactions,
      userGoals,
      currentVault 
    } = getMockDataForUser(userId, selectedWorkspaceId);

    if (!user) {
      console.error("User not found, redirecting.");
      router.push('/login');
      return;
    }

    setCurrentUser(user);
    setWorkspaceId(selectedWorkspaceId);

    // Filter transactions for the current month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyTransactions = userTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    setTransactions(monthlyTransactions);
    setAccounts(userAccounts);
    setGoals(userGoals);
    
    // Set workspace name and partner
    if (selectedWorkspaceId === userId) {
        setWorkspaceName("Minha Conta Pessoal");
        setPartner(null);
    } else if (currentVault) {
        setWorkspaceName(currentVault.name);
        const otherMember = currentVault.members.find(m => m.id !== userId);
        setPartner(otherMember || null);
    } else {
        console.error("Vault not found, redirecting.");
        router.push('/vaults');
    }

  }, [router]);
  
  const liquidAssets = accounts
    .filter(a => a.type === 'checking' || a.type === 'savings')
    .reduce((sum, a) => sum + a.balance, 0);

  const investedAssets = accounts
    .filter(a => a.type === 'investment')
    .reduce((sum, a) => sum + a.balance, 0);
    
  const goalAssets = goals.reduce((sum, g) => sum + g.currentAmount, 0);

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
                <NetWorthSummary
                  liquidAssets={liquidAssets}
                  investedAssets={investedAssets + goalAssets}
                />
              </AnimatedDiv>
              <AnimatedDiv transition={{ delay: 0.2 }}>
                <RecentTransactions 
                    transactions={transactions} 
                    accounts={accounts}
                    ownerId={workspaceId} 
                    ownerType={workspaceId === currentUser.id ? 'user' : 'vault'} 
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

export default withAuth(DashboardPage);
