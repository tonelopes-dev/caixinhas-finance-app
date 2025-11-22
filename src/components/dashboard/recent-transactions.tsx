
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Transaction, Account, Goal } from '@/lib/definitions';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListFilter, ArrowRight, Repeat } from 'lucide-react';
import { Button } from '../ui/button';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

type RecentTransactionsProps = {
  transactions: Transaction[];
  accounts: Account[];
  goals: Goal[];
  categories: any[];
  ownerId: string;
  ownerType: 'user' | 'vault';
  typeFilter: 'all' | 'income' | 'expense' | 'transfer';
  onFilterChange: (filter: 'all' | 'income' | 'expense' | 'transfer') => void;
};

export default function RecentTransactions({ transactions, accounts, goals, categories, ownerId, ownerType, typeFilter, onFilterChange }: RecentTransactionsProps) {

    const baseTransactions = useMemo(() => {
        // Sort by most recent
        return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        if (typeFilter === 'all') {
            return baseTransactions;
        }
        return baseTransactions.filter((transaction) => transaction.type === typeFilter);
    }, [baseTransactions, typeFilter]);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
    }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline">Transações Recentes</CardTitle>
          <CardDescription>O dia a dia financeiro deste espaço.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={(value) => onFilterChange(value as any)}>
                <SelectTrigger className="w-auto h-9">
                    <ListFilter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="income">Entradas</SelectItem>
                    <SelectItem value="expense">Saídas</SelectItem>
                    <SelectItem value="transfer">Transferências</SelectItem>
                </SelectContent>
            </Select>
            <AddTransactionDialog accounts={accounts} goals={goals} categories={categories} ownerId={ownerId} />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead className="hidden sm:table-cell">Categoria</TableHead>
              <TableHead className="hidden sm:table-cell">Data</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.slice(0, 5).map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="font-medium">{transaction.description}</div>
                   <div className="flex items-center gap-2 mt-1">
                    {transaction.isRecurring && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                        <Repeat className="mr-1 h-3 w-3" />
                        Recorrente
                      </Badge>
                    )}
                    {transaction.isInstallment && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                        Parcelado ({transaction.installmentNumber}/{transaction.totalInstallments})
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                    <Badge variant={transaction.type === 'income' ? 'secondary' : 'outline'}>
                        {typeof transaction.category === 'object' ? (transaction.category as any)?.name : transaction.category}
                    </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{formatDate(transaction.date)}</TableCell>
                <TableCell className={cn("text-right font-medium", {
                    'text-green-600': transaction.type === 'income',
                    'text-red-500': transaction.type === 'expense',
                    'text-muted-foreground': transaction.type === 'transfer'
                })}>
                  {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''} {formatCurrency(transaction.amount)}
                </TableCell>
              </TableRow>
            ))}
             {filteredTransactions.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Nenhuma transação encontrada.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex justify-center mt-4">
          <Button variant="ghost" asChild>
            <Link href="/transactions">
              Ver todas as transações
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
