import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@/lib/definitions';
import { AddTransactionSheet } from './add-transaction-sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListFilter, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

type RecentTransactionsProps = {
  transactions: Transaction[];
};

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
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
          <CardDescription>O dia a dia financeiro de vocês.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
            <Select>
                <SelectTrigger className="w-auto h-9">
                    <ListFilter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="income">Entradas</SelectItem>
                    <SelectItem value="expense">Saídas</SelectItem>
                </SelectContent>
            </Select>
            <AddTransactionSheet />
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
            {transactions.slice(0, 5).map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="font-medium">{transaction.description}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                    <Badge variant={transaction.type === 'income' ? 'secondary' : 'outline'}>
                        {transaction.category}
                    </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{formatDate(transaction.date)}</TableCell>
                <TableCell className={`text-right font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-foreground'}`}>
                  {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                </TableCell>
              </TableRow>
            ))}
             {transactions.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Nenhuma transação registrada.
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
