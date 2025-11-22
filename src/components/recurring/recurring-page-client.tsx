'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Repeat, Repeat1 } from 'lucide-react';
import type { Transaction } from '@/lib/definitions';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface RecurringPageClientProps {
  recurring: Transaction[];
  installments: Transaction[];
}

export function RecurringPageClient({ recurring, installments }: RecurringPageClientProps) {
  
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
            {Object.entries(groupedInstallments).map(([description, group]) => {
              // Assume que todas as parcelas do grupo têm o mesmo total de parcelas e valor
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
                        {formatCurrency(paidAmount)} / {formatCurrency(totalAmount)}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {paidInstallments} de {totalInstallments} pagas
                    </Badge>
                  </div>
                  <Progress value={progress} className="mt-2" />
                </div>
              )
            })}
             {Object.keys(groupedInstallments).length === 0 && (
                <p className="text-center text-muted-foreground py-4">Nenhuma compra parcelada encontrada.</p>
             )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Repeat className="h-6 w-6 text-primary" />
            Pagamentos Recorrentes
          </CardTitle>
          <CardDescription>
            Gerencie suas assinaturas e pagamentos mensais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recurring.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.description}</TableCell>
                  <TableCell><Badge variant="secondary">{t.category}</Badge></TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(t.amount)}</TableCell>
                </TableRow>
              ))}
               {recurring.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">Nenhum pagamento recorrente encontrado.</TableCell>
                </TableRow>
               )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
