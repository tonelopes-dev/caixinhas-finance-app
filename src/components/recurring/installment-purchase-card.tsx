
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
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Transaction } from '@/lib/definitions';
import { updatePaidInstallmentsAction } from '@/app/recurring/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface InstallmentPurchaseCardProps {
  purchase: Transaction & { paidInstallments: number[] };
}

export function InstallmentPurchaseCard({ purchase }: InstallmentPurchaseCardProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // O estado agora é um array com os números das parcelas pagas
  const [paidInstallments, setPaidInstallments] = useState<number[]>(purchase.paidInstallments || []);

  useEffect(() => {
    setPaidInstallments(purchase.paidInstallments || []);
  }, [purchase]);

  const totalInstallments = purchase.totalInstallments || 1;
  const installmentAmount = totalInstallments > 0 ? purchase.amount / totalInstallments : 0;
  const totalAmount = purchase.amount;
  const paidAmount = paidInstallments.length * installmentAmount;
  const progress = (paidInstallments.length / totalInstallments) * 100;

  const handleCheckboxChange = async (installmentNumber: number, checked: boolean) => {
    const newPaidInstallments = checked
      ? [...paidInstallments, installmentNumber]
      : paidInstallments.filter((p) => p !== installmentNumber);

    // Atualiza a UI otimisticamente
    setPaidInstallments(newPaidInstallments);

    const result = await updatePaidInstallmentsAction(purchase.id, newPaidInstallments);

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
        <CollapsibleTrigger asChild>
          <div className="flex justify-between items-start cursor-pointer">
            <div className="flex-1">
              <h3 className="font-semibold">{purchase.description}</h3>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(paidAmount)} / {formatCurrency(totalAmount)}
              </p>
            </div>
            <div className='flex items-center gap-4'>
                <p className="text-sm font-medium text-primary">
                    {paidInstallments.length} de {totalInstallments} pagas
                </p>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <span className="sr-only">Toggle</span>
                </Button>
            </div>
          </div>
        </CollapsibleTrigger>
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
                    "flex items-center space-x-2 rounded-md border p-2 transition-colors",
                    "cursor-pointer hover:bg-muted/50",
                    isChecked && "bg-primary/10"
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

