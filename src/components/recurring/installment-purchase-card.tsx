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
      <div className="bg-white/40 backdrop-blur-3xl rounded-[40px] p-8 border border-white/60 shadow-[0_20px_50px_rgba(45,36,30,0.06)] transition-all duration-500 hover:shadow-[0_30px_70px_rgba(45,36,30,0.1)] overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <CollapsibleTrigger asChild>
            <div className="flex-1 cursor-pointer group">
              <h3 className="text-2xl font-headline italic text-[#2D241E] tracking-tight group-hover:text-[#ff6b7b] transition-colors">{purchase.description}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-black text-[#ff6b7b] tracking-tight">{formatCurrency(paidAmount)}</span>
                <span className="text-[10px] font-black text-[#2D241E]/20 uppercase tracking-[0.2em] italic">de</span>
                <span className="text-sm font-bold text-[#2D241E]/30">{formatCurrency(totalAmount)}</span>
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
                <DropdownMenuContent align="end" className="rounded-[28px] border-white/40 shadow-2xl backdrop-blur-3xl bg-[#fdfcf7]/95 p-2 min-w-[200px]">
                    <EditTransactionDialog
                      transaction={purchase as Transaction}
                      accounts={allAccounts}
                      goals={allGoals}
                      categories={allCategories}
                      trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer font-black text-[10px] uppercase tracking-widest p-3 rounded-xl mb-1">
                          <Edit className="mr-2 h-4 w-4" />
                          Editar Transação
                        </DropdownMenuItem>
                      }
                    />
                    <DeleteTransactionDialog 
                      transactionId={purchase.id} 
                      trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer font-black text-[10px] uppercase tracking-widest p-3 rounded-xl">
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

        <div className="relative h-3 w-full bg-white/40 rounded-full overflow-hidden border border-white/60 shadow-inner">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: "circOut" }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#ff6b7b] to-[#ff8e9a] rounded-full shadow-[0_0_20px_rgba(255,107,123,0.4)]"
            />
        </div>

        <CollapsibleContent className="space-y-6 pt-10">
            <div className="flex items-center gap-3 mb-2">
                <div className="h-[2px] w-12 rounded-full bg-gradient-to-r from-[#ff6b7b] to-transparent" />
                <span className="text-[10px] font-black text-[#2D241E]/40 uppercase tracking-[0.3em] italic">Mapa das Parcelas</span>
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
                      "absolute top-3 right-3 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                      isChecked ? "bg-emerald-500 border-emerald-300 scale-110 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-white/50 border-[#2D241E]/5"
                  )}>
                      {isChecked && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-2 w-2 rounded-full bg-white shadow-sm" />}
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
                      "w-6 h-[2px] rounded-full mt-1",
                      isChecked ? "bg-emerald-400" : "bg-[#2D241E]/10"
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
