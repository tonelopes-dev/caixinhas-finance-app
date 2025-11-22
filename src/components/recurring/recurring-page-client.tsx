
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
import { InstallmentPurchaseCard } from './installment-purchase-card';
import { cn } from '@/lib/utils';


function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

interface RecurringPageClientProps {
  recurring: Transaction[];
  installments: Transaction[];
  allAccounts: Account[];
  allGoals: Goal[];
  allCategories: any[];
  workspaceId: string;
}

export function RecurringPageClient({
  recurring,
  installments,
  allAccounts,
  allGoals,
  allCategories,
  workspaceId,
}: RecurringPageClientProps) {
  const router = useRouter();

  // Agrupa as transações de parcelamento pela descrição
  const groupedInstallments = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    installments.forEach((t) => {
      // Usa a descrição como chave, mas normaliza para evitar problemas
      const key = t.description.trim().toLowerCase();
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(t);
    });
    return Object.values(groups).map(group => group[0]); // Retorna apenas o primeiro item de cada grupo como "representante"
  }, [installments]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Repeat1 className="h-6 w-6 text-primary" />
            Pagamentos Parcelados
          </CardTitle>
          <CardDescription>
            Acompanhe o andamento de todas as suas compras parceladas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {groupedInstallments.length > 0 ? (
              groupedInstallments.map((installment) => (
                <InstallmentPurchaseCard 
                  key={installment.id} 
                  purchase={installment} 
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

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Repeat className="h-6 w-6 text-primary" />
              Pagamentos Recorrentes
            </CardTitle>
            <CardDescription>
              Gerencie suas assinaturas e pagamentos mensais.
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
                <TableHead className="hidden sm:table-cell">Data Próxima</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recurring.length > 0 ? (
                recurring.map((t) => (
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
                    Nenhum pagamento recorrente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
