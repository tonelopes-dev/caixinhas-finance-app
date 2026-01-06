'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Repeat,
  Repeat1,
  MoreHorizontal,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type { Transaction, Account, Goal } from '@/lib/definitions';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { EditTransactionDialog } from '@/components/transactions/edit-transaction-dialog';
import { DeleteTransactionDialog } from '../transactions/delete-transaction-dialog';
import { InstallmentCard } from './installment-purchase-card';
import { cn } from '@/lib/utils';


function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

interface RecurringPageClientProps {
  recurringExpenses: Transaction[];
  recurringIncomes: Transaction[];
  installmentExpenses: Transaction[];
  installmentIncomes: Transaction[];
  allAccounts: Account[];
  allGoals: Goal[];
  allCategories: any[];
  workspaceId: string;
}

export function RecurringPageClient({
  recurringExpenses,
  recurringIncomes,
  installmentExpenses,
  installmentIncomes,
  allAccounts,
  allGoals,
  allCategories,
  workspaceId,
}: RecurringPageClientProps) {
  const router = useRouter();

  // Não agrupa mais - cada transação parcelada é única
  const groupedInstallmentExpenses = useMemo(() => {
    return installmentExpenses;
  }, [installmentExpenses]);

  const groupedInstallmentIncomes = useMemo(() => {
    return installmentIncomes;
  }, [installmentIncomes]);

  return (
    <div className="space-y-8">
      {/* 1. Entradas Parceladas */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 font-headline">
              <TrendingUp className="h-6 w-6 text-primary" />
              Entradas Parceladas
            </CardTitle>
            <CardDescription>
              Gerencie todos os seus recebimentos parcelados.
            </CardDescription>
          </div>
           <AddTransactionDialog
            accounts={allAccounts}
            goals={allGoals}
            categories={allCategories}
            ownerId={workspaceId}
            chargeType="installment"
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {groupedInstallmentIncomes.length > 0 ? (
              groupedInstallmentIncomes.map((installment) => (
                <InstallmentCard
                  key={installment.id}
                  transaction={installment as Transaction}
                  allAccounts={allAccounts}
                  allGoals={allGoals}
                  allCategories={allCategories}
                />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Nenhum recebimento parcelado encontrado.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2. Transações Recorrentes */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Repeat className="h-6 w-6 text-primary" />
              Transações Recorrentes
            </CardTitle>
            <CardDescription>
              Gerencie suas assinaturas e pagamentos/recebimentos mensais.
            </CardDescription>
          </div>
          <AddTransactionDialog
            accounts={allAccounts}
            goals={allGoals}
            categories={allCategories}
            ownerId={workspaceId}
            chargeType="recurring"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead className="hidden md:table-cell">Categoria</TableHead>
                <TableHead className="hidden sm:table-cell">Próxima Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...recurringExpenses, ...recurringIncomes].length > 0 ? (
                [...recurringExpenses, ...recurringIncomes].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.description}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary">{typeof t.category === 'object' ? (t.category as any).name : t.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {formatDate(t.date)}
                    </TableCell>
                    <TableCell className={cn("text-right font-medium", {
                        'text-green-600': t.type === 'income',
                        'text-red-500': t.type === 'expense',
                        'text-muted-foreground': t.type === 'transfer'
                    })}>
                      {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}{formatCurrency(t.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <EditTransactionDialog
                            transaction={t}
                            accounts={allAccounts}
                            goals={allGoals}
                            categories={allCategories}
                          />
                          <DeleteTransactionDialog transactionId={t.id} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    Nenhuma transação recorrente encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 3. Pagamentos Parcelados */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 font-headline">
              <TrendingDown className="h-6 w-6 text-primary" />
              Pagamentos Parcelados
            </CardTitle>
            <CardDescription>
              Acompanhe o andamento de todas as suas compras parceladas.
            </CardDescription>
          </div>
           <AddTransactionDialog
            accounts={allAccounts}
            goals={allGoals}
            categories={allCategories}
            ownerId={workspaceId}
            chargeType="installment"
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {groupedInstallmentExpenses.length > 0 ? (
              groupedInstallmentExpenses.map((installment) => (
                <InstallmentCard
                  key={installment.id}
                  transaction={installment as Transaction}
                  allAccounts={allAccounts}
                  allGoals={allGoals}
                  allCategories={allCategories}
                />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma compra parcelada encontrada.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
