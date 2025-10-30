import Header from '@/components/dashboard/header';
import BalanceSummary from '@/components/dashboard/balance-summary';
import GoalBuckets from '@/components/dashboard/goal-buckets';
import RecentTransactions from '@/components/dashboard/recent-transactions';
import BudgetAnalysis from '@/components/dashboard/budget-analysis';
import { goals, transactions, user, partner, totalIncome, totalExpenses } from '@/lib/data';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header user={user} partner={partner} />
      <main className="flex-1 p-4 md:p-8 lg:p-10">
        <div className="mx-auto grid w-full max-w-7xl gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
              Painel de Controle
            </h1>
            <p className="text-muted-foreground font-headline">
              “Sonhar juntos é o primeiro passo para conquistar.”
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="grid auto-rows-max items-start gap-8 lg:col-span-2">
              <BalanceSummary
                income={totalIncome}
                expenses={totalExpenses}
              />
              <RecentTransactions transactions={transactions} />
            </div>
            <div className="grid auto-rows-max items-start gap-8">
              <GoalBuckets goals={goals} />
              <BudgetAnalysis 
                goals={goals}
                income={totalIncome}
                expenses={transactions.filter(t => t.type === 'expense').reduce((acc, t) => ({...acc, [t.category]: (acc[t.category] || 0) + t.amount}), {} as Record<string, number>)}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
