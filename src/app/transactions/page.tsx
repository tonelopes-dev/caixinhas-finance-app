'use client';

import Link from 'next/link';
import { ArrowLeft, ListFilter } from 'lucide-react';
import { transactions as allTransactions } from '@/lib/data';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AddTransactionSheet } from '@/components/dashboard/add-transaction-sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

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
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
];

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState(currentYear.toString());

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      const typeMatch = typeFilter === 'all' || transaction.type === typeFilter;
      const monthMatch =
        monthFilter === 'all' ||
        transactionDate.getMonth() + 1 === parseInt(monthFilter);
      const yearMatch =
        yearFilter === 'all' ||
        transactionDate.getFullYear() === parseInt(yearFilter);
      return typeMatch && monthMatch && yearMatch;
    });
  }, [typeFilter, monthFilter, yearFilter]);

  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;
    return { income, expenses, balance };
  }, [filteredTransactions]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Painel
          </Link>
        </Button>

        <Card className="mb-8">
            <CardHeader>
                <CardTitle className='font-headline'>Resumo do Período</CardTitle>
                <CardDescription>Balanço de entradas e saídas para os filtros selecionados.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="grid gap-4 md:grid-cols-3">
                    <div className='flex items-center gap-4 rounded-lg border p-4'>
                         <div className="rounded-full bg-primary/10 p-3">
                            <Wallet className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Saldo Líquido</p>
                            <p className="text-xl font-bold">{formatCurrency(summary.balance)}</p>
                        </div>
                    </div>
                     <div className='flex items-center gap-4 rounded-lg border p-4'>
                         <div className="rounded-full bg-green-500/10 p-3">
                            <TrendingUp className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Entradas</p>
                            <p className="text-xl font-bold">{formatCurrency(summary.income)}</p>
                        </div>
                    </div>
                     <div className='flex items-center gap-4 rounded-lg border p-4'>
                         <div className="rounded-full bg-red-500/10 p-3">
                            <TrendingDown className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Saídas</p>
                            <p className="text-xl font-bold">{formatCurrency(summary.expenses)}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle className="font-headline text-2xl">
                Histórico de Transações
              </CardTitle>
              <CardDescription>
                Seu histórico financeiro completo e detalhado.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center">
              <div className='flex flex-1 items-center gap-2'>
                <ListFilter className="h-5 w-5 text-muted-foreground" />
                <span className='text-sm font-medium'>Filtros:</span>
              </div>
              <div className="flex flex-1 gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-auto">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="income">Entradas</SelectItem>
                    <SelectItem value="expense">Saídas</SelectItem>
                  </SelectContent>
                </Select>
                 <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger className="w-full md:w-auto">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-full md:w-auto">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">Todos os Anos</SelectItem>
                    {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <AddTransactionSheet />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="font-medium">{transaction.description}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.type === 'income' ? 'secondary' : 'outline'
                        }
                      >
                        {transaction.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        transaction.type === 'income'
                          ? 'text-green-600'
                          : 'text-foreground'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}{' '}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Nenhuma transação encontrada para os filtros selecionados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
