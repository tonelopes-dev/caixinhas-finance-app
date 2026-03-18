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
    <div className="space-y-12 pb-20">
      {/* 1. Entradas Parceladas */}
      <section className="bg-white/40 backdrop-blur-xl rounded-[40px] border border-white/40 shadow-[0_20px_50px_rgba(45,36,30,0.06)] overflow-hidden transition-all duration-500 hover:shadow-[0_30px_70px_rgba(45,36,30,0.1)]">
        <div className="p-8 md:p-10 border-b border-white/20 bg-white/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                <TrendingUp size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#2D241E] tracking-tight">Entradas Parceladas</h2>
              <p className="text-sm font-bold text-[#2D241E]/40 uppercase tracking-widest mt-1">Gerencie seus recebimentos parcelados</p>
            </div>
          </div>
          <AddTransactionDialog
            accounts={allAccounts}
            goals={allGoals}
            categories={allCategories}
            ownerId={workspaceId}
            chargeType="installment"
          />
        </div>
        <div className="p-8 md:p-10 space-y-6">
          {groupedInstallmentIncomes.length > 0 ? (
            groupedInstallmentIncomes.map((installment) => (
              <InstallmentCard
                key={installment.id}
                transaction={installment as any}
                allAccounts={allAccounts}
                allGoals={allGoals}
                allCategories={allCategories}
              />
            ))
          ) : (
            <div className="py-20 text-center text-[#2D241E]/20 space-y-4">
              <div className="p-8 bg-white/30 w-fit mx-auto rounded-[32px] border border-white/50">
                <TrendingUp size={48} className="animate-pulse" />
              </div>
              <p className="font-black text-lg tracking-tight">Nenhum recebimento parcelado</p>
            </div>
          )}
        </div>
      </section>

      {/* 2. Transações Recorrentes */}
      <section className="bg-white/40 backdrop-blur-xl rounded-[40px] border border-white/40 shadow-[0_20px_50px_rgba(45,36,30,0.06)] overflow-hidden transition-all duration-500 hover:shadow-[0_30px_70px_rgba(45,36,30,0.1)]">
        <div className="p-8 md:p-10 border-b border-white/20 bg-white/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm">
                <Repeat size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#2D241E] tracking-tight">Transações Recorrentes</h2>
              <p className="text-sm font-bold text-[#2D241E]/40 uppercase tracking-widest mt-1">Assinaturas e pagamentos mensais</p>
            </div>
          </div>
          <AddTransactionDialog
            accounts={allAccounts}
            goals={allGoals}
            categories={allCategories}
            ownerId={workspaceId}
            chargeType="recurring"
          />
        </div>
        <div className="p-0">
          <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-white/10 hover:bg-transparent">
                        <TableHead className="py-8 px-10 text-[11px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40">Descrição</TableHead>
                        <TableHead className="py-8 text-[11px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40">Categoria</TableHead>
                        <TableHead className="py-8 text-[11px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40 text-center">Próxima Data</TableHead>
                        <TableHead className="py-8 text-right text-[11px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40">Valor</TableHead>
                        <TableHead className="py-8 text-center text-[11px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40 pr-10">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {[...recurringExpenses, ...recurringIncomes].length > 0 ? (
                    [...recurringExpenses, ...recurringIncomes].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((t) => (
                    <TableRow key={t.id} className="group border-b border-white/5 hover:bg-white/40 transition-all duration-300">
                        <TableCell className="py-6 px-10">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:rotate-[360deg] shadow-sm",
                                    t.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-[#ff6b7b]/10 text-[#ff6b7b]"
                                )}>
                                    <Repeat1 size={16} />
                                </div>
                                <span className="text-base font-bold text-[#2D241E] group-hover:text-[#ff6b7b] transition-colors">{t.description}</span>
                            </div>
                        </TableCell>
                        <TableCell className="py-6">
                            <Badge variant="secondary" className="px-4 py-1.5 rounded-xl bg-white/60 text-[#2D241E]/60 border-none font-bold text-[10px] uppercase tracking-widest shadow-sm">
                                {typeof t.category === 'object' ? (t.category as any).name : t.category}
                            </Badge>
                        </TableCell>
                        <TableCell className="py-6 text-center">
                            <span className="text-sm font-bold text-[#2D241E]/50">
                                {formatDate(t.date)}
                            </span>
                        </TableCell>
                        <TableCell className={cn(
                            "py-6 text-right font-black text-xl tracking-tighter",
                            t.type === 'income' ? "text-emerald-600" : "text-[#ff6b7b]"
                        )}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </TableCell>
                        <TableCell className="py-6 pr-10">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <EditTransactionDialog
                                transaction={t}
                                accounts={allAccounts}
                                goals={allGoals}
                                categories={allCategories}
                            />
                            <DeleteTransactionDialog transactionId={t.id} />
                        </div>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-64 text-center">
                            <p className="text-[#2D241E]/20 font-black uppercase tracking-widest text-xs">Nenhuma transação recorrente encontrada</p>
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* 3. Pagamentos Parcelados */}
      <section className="bg-white/40 backdrop-blur-xl rounded-[40px] border border-white/40 shadow-[0_20px_50px_rgba(45,36,30,0.06)] overflow-hidden transition-all duration-500 hover:shadow-[0_30px_70px_rgba(45,36,30,0.1)]">
        <div className="p-8 md:p-10 border-b border-white/20 bg-white/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-[#ff6b7b]/10 text-[#ff6b7b] flex items-center justify-center shadow-sm">
                <TrendingDown size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#2D241E] tracking-tight">Pagamentos Parcelados</h2>
              <p className="text-sm font-bold text-[#2D241E]/40 uppercase tracking-widest mt-1">Compras e despesas parceladas</p>
            </div>
          </div>
          <AddTransactionDialog
            accounts={allAccounts}
            goals={allGoals}
            categories={allCategories}
            ownerId={workspaceId}
            chargeType="installment"
          />
        </div>
        <div className="p-8 md:p-10 space-y-6">
          {groupedInstallmentExpenses.length > 0 ? (
            groupedInstallmentExpenses.map((installment) => (
              <InstallmentCard
                key={installment.id}
                transaction={installment as any}
                allAccounts={allAccounts}
                allGoals={allGoals}
                allCategories={allCategories}
              />
            ))
          ) : (
            <div className="py-20 text-center text-[#2D241E]/20 space-y-4">
              <div className="p-8 bg-white/30 w-fit mx-auto rounded-[32px] border border-white/50">
                <TrendingDown size={48} className="animate-pulse" />
              </div>
              <p className="font-black text-lg tracking-tight">Nenhuma compra parcelada</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
