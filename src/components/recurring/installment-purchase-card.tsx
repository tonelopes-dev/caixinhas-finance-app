
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

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface InstallmentPurchaseCardProps {
  purchase: Transaction;
}

export function InstallmentPurchaseCard({ purchase }: InstallmentPurchaseCardProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  // Calcula o número de parcelas que já deveriam ter sido pagas
  const calculateDefaultPaid = () => {
    const startDate = new Date(purchase.date);
    const now = new Date();
    // Diferença em meses
    let monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12;
    monthsDiff -= startDate.getMonth();
    monthsDiff += now.getMonth();
    monthsDiff = Math.max(0, monthsDiff); // Garante que não seja negativo

    // O número de parcelas pagas é a diferença em meses + 1 (para incluir o mês da compra)
    // Limitado ao número total de parcelas
    return Math.min(purchase.totalInstallments || 1, monthsDiff + 1);
  };
  
  // Usa o valor do DB se existir, senão calcula o padrão
  const initialPaidCount = purchase.paidInstallments ?? calculateDefaultPaid();
  const [paidCount, setPaidCount] = useState(initialPaidCount);

  useEffect(() => {
    // Atualiza o estado se a prop inicial mudar
    setPaidCount(purchase.paidInstallments ?? calculateDefaultPaid());
  }, [purchase]);

  const totalInstallments = purchase.totalInstallments || 1;
  const installmentAmount = totalInstallments > 0 ? purchase.amount / totalInstallments : 0;
  const totalAmount = purchase.amount;
  const paidAmount = paidCount * installmentAmount;
  const progress = (paidCount / totalInstallments) * 100;

  const handleCheckboxChange = async (installmentNumber: number, checked: boolean) => {
    // Para simplificar, a lógica de "marcar" apenas conta quantos estão marcados
    const newPaidCount = checked
      ? Math.min(totalInstallments, paidCount + 1) // Encontra o próximo desmarcado e marca
      : Math.max(0, paidCount - 1); // Desmarca o último marcado

    // Atualiza a UI otimisticamente
    const tempPaidCount = Array.from({ length: totalInstallments }, (_, i) => i < newPaidCount).filter(Boolean).length;
    setPaidCount(tempPaidCount);

    const result = await updatePaidInstallmentsAction(purchase.id, tempPaidCount);

    if (!result.success) {
      // Reverte em caso de erro
      setPaidCount(paidCount);
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
                    {paidCount} de {totalInstallments} pagas
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
              const isChecked = installmentNumber <= paidCount;

              return (
                <div key={index} className="flex items-center space-x-2 rounded-md border p-2">
                  <Checkbox
                    id={`installment-${purchase.id}-${installmentNumber}`}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(installmentNumber, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`installment-${purchase.id}-${installmentNumber}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Parcela {installmentNumber}/{totalInstallments}
                  </label>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
