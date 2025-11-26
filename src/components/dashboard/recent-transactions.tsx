
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Transaction, Account, Goal } from '@/lib/definitions';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListFilter, ArrowRight, Repeat, Landmark, PiggyBank } from 'lucide-react';
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

    const getAccountName = (id: string) => {
      if (id.startsWith('goal')) {
          const goal = goals.find(g => g.id === id);
          return goal ? `Caixinha: ${goal.name}` : 'Caixinha';
      }
      const account = accounts.find(a => a.id === id);
      return account ? account.name : 'Conta desconhecida';
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
              <TableHead className="hidden lg:table-cell">Contas</TableHead>
              <TableHead className="hidden xl:table-cell">Frequência</TableHead>
              <TableHead className="hidden sm:table-cell">Data</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.slice(0, 5).map((transaction: any) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="font-medium">{transaction.description}</div>
                  <div className="text-xs text-muted-foreground">
                    {/* Payment method can be shown here if needed on mobile */}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                    <Badge variant={transaction.type === 'income' ? 'secondary' : 'outline'}>
                        {typeof transaction.category === 'object' ? (transaction.category as any)?.name : transaction.category}
                    </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-xs">
                    {transaction.sourceAccountId ? (
                        <div className='flex items-center gap-1 text-muted-foreground'>
                            <Landmark className="h-3 w-3 text-red-500" />
                            <span>{getAccountName(transaction.sourceAccountId)}</span>
                        </div>
                    ) : (transaction.goalId && transaction.type === 'transfer' && transaction.destinationAccountId) ? (
                        <div className='flex items-center gap-1 text-muted-foreground'>
                            <PiggyBank className="h-3 w-3 text-red-500"/>
                            <span>{transaction.goal?.name ? `Caixinha: ${transaction.goal.name}` : 'Caixinha'}</span>
                        </div>
                    ) : null}
                    
                    {transaction.destinationAccountId ? (
                        <div className='flex items-center gap-1 text-muted-foreground mt-1'>
                            <Landmark className="h-3 w-3 text-green-500" />
                            <span>{getAccountName(transaction.destinationAccountId)}</span>
                        </div>
                    ) : (transaction.goalId && transaction.type === 'transfer' && transaction.sourceAccountId) ? (
                        <div className='flex items-center gap-1 text-muted-foreground mt-1'>
                            <PiggyBank className="h-3 w-3 text-green-500"/>
                            <span>{transaction.goal?.name ? `Caixinha: ${transaction.goal.name}` : 'Caixinha'}</span>
                        </div>
                    ) : null}
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  {transaction.isRecurring && (
                    <Badge variant="outline" className="border-purple-300 text-purple-800">
                      Recorrente
                    </Badge>
                  )}
                  {transaction.isInstallment && (
                    <Badge variant="outline" className="border-blue-300 text-blue-800">
                      Parcelado ({transaction.paidInstallments.length}/{transaction.totalInstallments})
                    </Badge>
                  )}
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
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
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
