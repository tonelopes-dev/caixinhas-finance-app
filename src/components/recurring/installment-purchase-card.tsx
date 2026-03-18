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
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, Trash2 } from 'lucide-react';
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
      <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-6 border border-white/60 shadow-[0_4px_20px_rgba(45,36,30,0.03)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(45,36,30,0.06)]">
        <div className="flex justify-between items-center mb-6">
          <CollapsibleTrigger asChild>
            <div className="flex-1 cursor-pointer group">
              <h3 className="font-black text-[#2D241E] text-lg tracking-tight group-hover:text-[#ff6b7b] transition-colors">{purchase.description}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-[#ff6b7b]">{formatCurrency(paidAmount)}</span>
                <span className="text-[10px] font-black text-[#2D241E]/20 uppercase tracking-widest">de</span>
                <span className="text-xs font-bold text-[#2D241E]/40">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </CollapsibleTrigger>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-black text-[#2D241E]/30 uppercase tracking-[0.2em]">Progresso</span>
                <p className="text-sm font-black text-[#2D241E]">
                {paidInstallments.length} <span className="text-[#2D241E]/30 font-bold">/ {totalInstallments}</span>
                </p>
            </div>
            <div className="flex items-center gap-1 bg-white/40 rounded-2xl p-1 border border-white/60">
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/60 text-[#2D241E]/40 hover:text-[#ff6b7b] transition-all">
                    <MoreHorizontal className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl border-white/40 shadow-2xl backdrop-blur-xl bg-white/90 p-1">
                    <EditTransactionDialog
                      transaction={purchase as Transaction}
                      accounts={allAccounts}
                      goals={allGoals}
                      categories={allCategories}
                      trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" />
                          Editar Transação
                        </DropdownMenuItem>
                      }
                    />
                    <DeleteTransactionDialog 
                      transactionId={purchase.id} 
                      trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir Registro
                        </DropdownMenuItem>
                      }
                    />
                </DropdownMenuContent>
                </DropdownMenu>
                <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl hover:bg-white/60 text-[#2D241E]/40 transition-all"
                onClick={() => setIsOpen(!isOpen)}
                >
                {isOpen ? (
                    <ChevronUp className="h-5 w-5" />
                ) : (
                    <ChevronDown className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle</span>
                </Button>
            </div>
          </div>
        </div>

        <div className="relative h-2 w-full bg-white/60 rounded-full overflow-hidden border border-white/60 shadow-inner">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#ff6b7b] to-[#ff8e9a] rounded-full shadow-[0_0_10px_rgba(255,107,123,0.3)]"
            />
        </div>

        <CollapsibleContent className="space-y-4 pt-8">
            <div className="flex items-center gap-2 mb-2">
                <div className="h-1 w-8 rounded-full bg-[#ff6b7b]/20" />
                <span className="text-[10px] font-black text-[#2D241E]/40 uppercase tracking-[0.2em]">Detalhes das Parcelas</span>
            </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: totalInstallments }).map((_, index) => {
              const installmentNumber = index + 1;
              const isChecked = paidInstallments.includes(installmentNumber);

              return (
                <label
                  key={index}
                  htmlFor={`installment-${purchase.id}-${installmentNumber}`}
                  className={cn(
                    'group relative flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden',
                    isChecked 
                      ? 'bg-emerald-50/50 border-emerald-100 shadow-[0_4px_15px_rgba(16,185,129,0.05)]' 
                      : 'bg-white/40 border-white/60 hover:bg-white/60 hover:border-white shadow-sm'
                  )}
                >
                  <div className={cn(
                      "absolute top-2 right-2 h-4 w-4 rounded-full border flex items-center justify-center transition-all",
                      isChecked ? "bg-emerald-500 border-emerald-500 scale-110 shadow-lg" : "bg-white/50 border-[#2D241E]/10"
                  )}>
                      {isChecked && <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
                  </div>

                  <Checkbox
                    id={`installment-${purchase.id}-${installmentNumber}`}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(installmentNumber, checked as boolean)
                    }
                    className="sr-only"
                  />
                  
                  <div className="text-center">
                    <span className={cn(
                        "block text-[10px] font-black uppercase tracking-widest",
                        isChecked ? "text-emerald-600/60" : "text-[#2D241E]/20"
                    )}>Parc.</span>
                    <span className={cn(
                        "text-lg font-black tracking-tight",
                        isChecked ? "text-emerald-700" : "text-[#2D241E]/60"
                    )}>
                        {installmentNumber}<span className="text-[10px] opacity-30">/{totalInstallments}</span>
                    </span>
                  </div>

                  <div className={cn(
                      "w-4 h-1 rounded-full",
                      isChecked ? "bg-emerald-400" : "bg-[#2D241E]/5"
                  )} />
                </label>
              );
            })}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
