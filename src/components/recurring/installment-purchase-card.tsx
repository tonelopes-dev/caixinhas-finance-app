'use client';

import React, { useEffect, useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
import type { Transaction, Account, Goal } from '@/lib/definitions';
import { updatePaidInstallmentsAction } from '@/app/recurring/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditTransactionDialog } from '@/components/transactions/edit-transaction-dialog';
import { DeleteTransactionDialog } from '@/components/transactions/delete-transaction-dialog';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface InstallmentCardProps {
  transaction: Transaction & { paidInstallments: number[] };
  allAccounts: Account[];
  allGoals: Goal[];
  allCategories: any[];
}

export function InstallmentCard({
  transaction: purchase,
  allAccounts,
  allGoals,
  allCategories,
}: InstallmentCardProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // O estado agora é um array com os números das parcelas pagas
  const [paidInstallments, setPaidInstallments] = useState<number[]>(
    purchase.paidInstallments || []
  );

  useEffect(() => {
    setPaidInstallments(purchase.paidInstallments || []);
  }, [purchase]);

  const totalInstallments = purchase.totalInstallments || 1;
  const installmentAmount =
    totalInstallments > 0 ? purchase.amount / totalInstallments : 0;
  const totalAmount = purchase.amount;
  const paidAmount = paidInstallments.length * installmentAmount;
  const progress = (paidInstallments.length / totalInstallments) * 100;

  const handleCheckboxChange = async (
    installmentNumber: number,
    checked: boolean
  ) => {
    const newPaidInstallments = checked
      ? [...paidInstallments, installmentNumber]
      : paidInstallments.filter((p) => p !== installmentNumber);

    // Atualiza a UI otimisticamente
    setPaidInstallments(newPaidInstallments);

    const result = await updatePaidInstallmentsAction(
      purchase.id,
      newPaidInstallments
    );

    if (!result.success) {
      // Reverte em caso de erro
      setPaidInstallments(paidInstallments);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a alteração.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border p-4">
        <div className="flex justify-between items-start">
          <CollapsibleTrigger asChild>
            <div className="flex-1 cursor-pointer">
              <h3 className="font-semibold">{purchase.description}</h3>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(paidAmount)} / {formatCurrency(totalAmount)}
              </p>
            </div>
          </CollapsibleTrigger>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-primary hidden sm:block">
              {paidInstallments.length} de {totalInstallments} pagas
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <EditTransactionDialog
                  transaction={purchase as Transaction}
                  accounts={allAccounts}
                  goals={allGoals}
                  categories={allCategories}
                />
                <DeleteTransactionDialog transactionId={purchase.id} />
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="sm"
              className="w-9 p-0"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle</span>
            </Button>
          </div>
        </div>

        <Progress value={progress} className="mt-2" />
        <CollapsibleContent className="space-y-2 pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {Array.from({ length: totalInstallments }).map((_, index) => {
              const installmentNumber = index + 1;
              const isChecked = paidInstallments.includes(installmentNumber);

              return (
                <label
                  key={index}
                  htmlFor={`installment-${purchase.id}-${installmentNumber}`}
                  className={cn(
                    'flex items-center space-x-2 rounded-md border p-2 transition-colors',
                    'cursor-pointer hover:bg-muted/50',
                    isChecked && 'bg-primary/10'
                  )}
                >
                  <Checkbox
                    id={`installment-${purchase.id}-${installmentNumber}`}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(installmentNumber, checked as boolean)
                    }
                  />
                  <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Parcela {installmentNumber}/{totalInstallments}
                  </span>
                </label>
              );
            })}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
