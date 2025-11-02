'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { transactions, goals, accounts } from '@/lib/data';
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

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
const months = [
    { value: 'all', label: 'Todos os meses' },
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', 'label': 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
];


export default function DashboardPage() {
    const [monthFilter, setMonthFilter] = useState((new Date().getMonth() + 1).toString());
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

    const filteredTransactions = useMemo(() => {
        return transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            const monthMatch = monthFilter === 'all' || transactionDate.getMonth() + 1 === parseInt(monthFilter);
            const yearMatch = yearFilter === 'all' || transactionDate.getFullYear() === parseInt(yearFilter);
            return monthMatch && yearMatch;
        });
    }, [monthFilter, yearFilter]);
    

    // Process data for charts using filteredTransactions
    const expensesByCategory = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

    const incomeVsExpenseData = filteredTransactions.reduce((acc, t) => {
        const month = new Date(t.date).toLocaleString('default', { month: 'short', timeZone: 'UTC' });
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
    
    // Sort by month for charts
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const sortedIncomeVsExpense = Object.values(incomeVsExpenseData).sort((a,b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

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
                <span className="text-sm text-muted-foreground">Período:</span>
                <Select value={monthFilter} onValueChange={setMonthFilter}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Mês" />
                    </SelectTrigger>
                    <SelectContent>
                        {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Anos</SelectItem>
                        {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
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
                            <p className="text-sm text-muted-foreground">Patrimônio Total</p>
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
