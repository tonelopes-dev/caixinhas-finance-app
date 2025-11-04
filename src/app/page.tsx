'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/dashboard/header';
import GoalBuckets from '@/components/dashboard/goal-buckets';
import RecentTransactions from '@/components/dashboard/recent-transactions';
import { goals as allGoals, transactions as allTransactions, users, vaults, getMockDataForUser, accounts as allAccounts } from '@/lib/data';
import { AnimatedDiv } from '@/components/ui/animated-div';
import { PwaPrompt } from '@/components/pwa-prompt';
import { MotivationalNudge } from '@/components/dashboard/motivational-nudge';
import withAuth from '@/components/auth/with-auth';
import type { Goal, Transaction, Vault, User, Account } from '@/lib/definitions';
import NetWorthSummary from '@/components/dashboard/net-worth-summary';

function HomePage() {
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

    const { currentUser: userFromMock, userAccounts } = getMockDataForUser(userId, selectedWorkspaceId);
    if (userFromMock) {
        setCurrentUser(userFromMock);
    }
    
    setWorkspaceId(selectedWorkspaceId);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const filterTransactionsByCurrentMonth = (trans: Transaction[]) => {
        return trans.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
        });
    }

    if (selectedWorkspaceId === userId) {
        const { userTransactions, userGoals } = getMockDataForUser(userId, selectedWorkspaceId);
        setWorkspaceName("Minha Conta Pessoal");
        setTransactions(filterTransactionsByCurrentMonth(userTransactions));
        setGoals(userGoals);
        setAccounts(userAccounts);
        setPartner(null);

    } else {
        const vault = vaults.find(v => v.id === selectedWorkspaceId);
        if (vault) {
            setWorkspaceName(vault.name);
            const vaultTransactions = allTransactions.filter(t => t.ownerId === selectedWorkspaceId && t.ownerType === 'vault');
            setTransactions(filterTransactionsByCurrentMonth(vaultTransactions));
            
            const vaultGoals = allGoals.filter(g => g.ownerId === selectedWorkspaceId && g.ownerType === 'vault');
            setGoals(vaultGoals);

            const vaultAccounts = allAccounts.filter(a => a.ownerId === selectedWorkspaceId && a.ownerType === 'vault');
            setAccounts(userAccounts); // Use userAccounts from the top-level fetch

            const otherMember = vault.members.find(m => m.id !== userId);
            if (otherMember) {
                setPartner(otherMember)
            } else {
                setPartner(null);
            }

        } else {
            console.error("Vault not found, redirecting.");
            router.push('/vaults');
        }
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
            </div>
          </div>
        </div>
      </main>
      <PwaPrompt />
    </div>
  );
}

export default withAuth(HomePage);
