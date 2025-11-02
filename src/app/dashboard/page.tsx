'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { transactions as allTransactions, goals } from '@/lib/data';
import { ExpensesByCategoryChart } from '@/components/dashboard/charts/expenses-by-category-chart';
import { AnimatedDiv } from '@/components/ui/animated-div';
import { IncomeVsExpenseChart } from '@/components/dashboard/charts/income-vs-expense-chart';
import { NetWorthChart } from '@/components/dashboard/charts/net-worth-chart';
import { GoalProgressChart } from '@/components/dashboard/charts/goal-progress-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getMockDataForUser } from '@/lib/data';
import { useRouter } from 'next/navigation';
import type { Transaction } from '@/lib/definitions';
import { subDays, startOfMonth, startOfYear, endOfDay } from 'date-fns';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';


type Period = 'this_month' | 'this_year' | 'last_30_days' | 'last_90_days' | 'all_time';

const periodOptions: { value: Period; label: string }[] = [
    { value: 'last_30_days', label: 'Últimos 30 dias' },
    { value: 'last_90_days', label: 'Últimos 90 dias' },
    { value: 'all_time', label: 'Desde o início' },
];


export default function DashboardPage() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [period, setPeriod] = useState<Period>('this_month');

    useEffect(() => {
        const userId = localStorage.getItem('DREAMVAULT_USER_ID');
        if (!userId) {
            router.push('/login');
            return;
        }

        const { userTransactions } = getMockDataForUser(userId);
        setTransactions(userTransactions);
    }, [router]);


    const filteredTransactions = useMemo(() => {
        const now = new Date();
        let startDate: Date;

        switch (period) {
            case 'this_month':
                startDate = startOfMonth(now);
                break;
            case 'this_year':
                startDate = startOfYear(now);
                break;
            case 'last_30_days':
                startDate = subDays(now, 30);
                break;
            case 'last_90_days':
                startDate = subDays(now, 90);
                break;
            case 'all_time':
                return allTransactions;
            default:
                startDate = startOfMonth(now);
        }

        const endDate = endOfDay(now);

        return allTransactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate >= startDate && transactionDate <= endDate;
        });
    }, [period]);
    

    // Process data for charts using filteredTransactions
    const expensesByCategory = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

    const incomeVsExpenseData = filteredTransactions.reduce((acc, t) => {
        const month = new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit', timeZone: 'UTC' });
        if (!acc[month]) {
            acc[month] = { month, income: 0, expenses: 0 };
        }
        if (t.type === 'income') {
            acc[month].income += t.amount;
        } else if (t.type === 'expense') {
            acc[month].expenses += t.amount;
        }
        return acc;
    }, {} as Record<string, { month: string, income: number, expenses: number }>);
    
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const sortedIncomeVsExpense = Object.values(incomeVsExpenseData).sort((a,b) => {
        const [aMonth, aYear] = a.month.split(' ');
        const [bMonth, bYear] = b.month.split(' ');
        if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);
        return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
    });

    const totalBalance = filteredTransactions.reduce((sum, t) => {
        if (t.type === 'income') return sum + t.amount;
        if (t.type === 'expense') return sum - t.amount;
        return sum;
    }, 0);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-7xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Painel
          </Link>
        </Button>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-8'>
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
                Dashboard Financeiro
            </h1>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
                <Tabs value={period} onValueChange={(value) => setPeriod(value as Period)} className="hidden md:block">
                    <TabsList>
                        <TabsTrigger value="this_month">Este Mês</TabsTrigger>
                        <TabsTrigger value="this_year">Este Ano</TabsTrigger>
                    </TabsList>
                </Tabs>
                 <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="this_month">Este Mês</SelectItem>
                        <SelectItem value="this_year">Este Ano</SelectItem>
                        {periodOptions.map(option => (
                             <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
             <AnimatedDiv className="lg:col-span-2">
                <IncomeVsExpenseChart data={sortedIncomeVsExpense} />
            </AnimatedDiv>
             <AnimatedDiv>
                <ExpensesByCategoryChart data={expensesByCategory} />
            </AnimatedDiv>
            <AnimatedDiv>
                <GoalProgressChart data={goals} />
            </AnimatedDiv>
            <AnimatedDiv className="lg:col-span-2">
                <NetWorthChart data={filteredTransactions} initialBalance={50000} />
            </AnimatedDiv>
             <AnimatedDiv className="md:col-span-2 lg:col-span-3">
                 <Card>
                    <CardHeader>
                        <CardTitle>Métricas Adicionais</CardTitle>
                        <CardDescription>Outros indicadores importantes do seu universo financeiro.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="rounded-lg border p-4">
                            <p className="text-sm text-muted-foreground">Saldo do Período</p>
                            <p className="text-2xl font-bold">{totalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <p className="text-sm text-muted-foreground">Total em Metas</p>
                            <p className="text-2xl font-bold">{goals.reduce((sum, g) => sum + g.currentAmount, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <p className="text-sm text-muted-foreground">Transações no Período</p>
                            <p className="text-2xl font-bold">{filteredTransactions.length}</p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <p className="text-sm text-muted-foreground">Meta Mais Próxima</p>
                            <p className="text-xl font-bold text-primary">{[...goals].sort((a,b) => (b.currentAmount/b.targetAmount) - (a.currentAmount/a.targetAmount))[0]?.name || 'N/A'}</p>
                        </div>
                    </CardContent>
                </Card>
            </AnimatedDiv>
        </div>
      </div>
    </div>
  );
}
