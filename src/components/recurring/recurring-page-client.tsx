
'use client';

import React, { useState } from 'react';
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
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { AddTransactionSheet } from '../dashboard/add-transaction-sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { EditTransactionSheet } from '../transactions/edit-transaction-sheet';
import { DeleteTransactionDialog } from '../transactions/delete-transaction-dialog';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

interface RecurringPageClientProps {
  recurring: Transaction[];
  installments: Transaction[];
  // Props para os componentes de ação
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
  const [isSheetOpen, setSheetOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }
  
  const groupedInstallments = installments.reduce((acc, t) => {
    // Usamos a descrição como chave para agrupar parcelas da mesma compra
    const key = t.description;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

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
            {Object.keys(groupedInstallments).length > 0 ? (
              Object.entries(groupedInstallments).map(
                ([description, group]) => {
                  const totalInstallments = group[0].totalInstallments || group.length;
                  const paidInstallments = group.length;
                  const progress = (paidInstallments / totalInstallments) * 100;
                  const installmentAmount = group[0].amount;
                  const totalAmount = installmentAmount * totalInstallments;
                  const paidAmount = group.reduce((sum, t) => sum + t.amount, 0);

                  return (
                    <div key={description} className="rounded-lg border p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{description}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(paidAmount)} /{' '}
                            {formatCurrency(totalAmount)}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {paidInstallments} de {totalInstallments} pagas
                        </Badge>
                      </div>
                      <Progress value={progress} className="mt-2" />
                    </div>
                  );
                }
              )
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
          <AddTransactionSheet
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
                <TableHead className="hidden sm:table-cell">Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-[80px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recurring.length > 0 ? (
                recurring.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.description}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary">{t.category.name}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {formatDate(t.date)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(t.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <EditTransactionSheet
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
