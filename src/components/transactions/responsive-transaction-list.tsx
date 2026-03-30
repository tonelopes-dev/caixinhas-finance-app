"use client";

import { DeleteTransactionDialog } from "@/components/transactions/delete-transaction-dialog";
import { EditTransactionDialog } from "@/components/transactions/edit-transaction-dialog";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { usePrivacyMode } from "@/hooks/use-privacy-mode";
import type { Account, Goal, Transaction } from "@/lib/definitions";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowRightLeft,
    TrendingDown,
    TrendingUp,
    Wallet
} from "lucide-react";
import React from "react";

type ResponsiveTransactionListProps = {
  transactions: Transaction[];
  accounts: Account[];
  goals: Goal[];
  categories: any[];
  emptyState?: React.ReactNode;
  disablePrivacyMode?: boolean;
};

// Helpers
function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function ResponsiveTransactionList({
  transactions,
  accounts,
  goals,
  categories,
  emptyState,
  disablePrivacyMode = false,
}: ResponsiveTransactionListProps) {
  const { isPrivate, isLoaded } = usePrivacyMode();

  const getAccountName = (id: string) => {
    if (!id) return "---";
    if (id.startsWith("goal")) {
      const goal = goals.find((g) => g.id === id);
      return goal ? `Caixinha: ${goal.name}` : "Caixinha";
    }
    const account = accounts.find((a) => a.id === id);
    return account ? account.name : "Conta";
  };

  const PrivacyBlur = () => (
    <span className="font-black tracking-tighter opacity-50">R$ •••</span>
  );

  if (transactions.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="relative">
      {/* Mobile View: Cards */}
      <div className="md:hidden space-y-4">
        <AnimatePresence mode="popLayout">
          {transactions.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "relative bg-white/80 backdrop-blur-3xl rounded-[32px] p-2 sm:p-6 border border-white/60 shadow-[0_8px_30px_rgba(45,36,30,0.04)] active:scale-[0.98] transition-all duration-500",
                t.type === "income"
                  ? "hover:border-emerald-200/50"
                  : "hover:border-rose-200/50",
              )}
            >
              <div className="flex flex-col gap-4">
                {/* Header: Icon + Info */}
                <div className="flex items-start gap-4 p-2">
                  <div
                    className={cn(
                      "h-11 w-11 rounded-2xl flex items-center justify-center shadow-sm border border-white/40 transition-all duration-700 shrink-0",
                      t.type === "income"
                        ? "bg-emerald-50 text-emerald-600"
                        : t.type === "expense"
                          ? "bg-rose-50 text-rose-600"
                          : "bg-blue-50 text-blue-600",
                    )}
                  >
                    {t.type === "income" ? (
                      <TrendingUp size={20} />
                    ) : t.type === "expense" ? (
                      <TrendingDown size={20} />
                    ) : (
                      <ArrowRightLeft size={20} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-white/80 text-[#2D241E]/40 border-none font-black text-[8px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-lg"
                      >
                        {t.category?.name || "Geral"}
                      </Badge>
                      <span className="text-[9px] font-black text-[#2D241E]/30 uppercase tracking-widest whitespace-nowrap">
                        {formatDate(t.date)}
                      </span>
                    </div>
                    <h4 className="font-headline italic text-[#2D241E] text-base sm:text-lg md:text-xl font-black leading-tight line-clamp-2">
                      {t.description}
                    </h4>
                  </div>
                </div>

                {/* Footer: Details + Amount */}
                <div className="p-3 border-t border-[#2D241E]/5 flex flex-col items-stretch sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
                  <div className="flex flex-col gap-2 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black text-[#2D241E]/40 uppercase tracking-widest truncate italic">
                      <Wallet className="h-3.5 w-3.5 shrink-0 opacity-50" />
                      <span className="truncate">
                        {t.sourceAccountId
                          ? getAccountName(t.sourceAccountId)
                          : t.destinationAccountId
                            ? getAccountName(t.destinationAccountId)
                            : "---"}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <EditTransactionDialog
                        transaction={t}
                        accounts={accounts}
                        goals={goals}
                        categories={categories}
                      />
                      <DeleteTransactionDialog transactionId={t.id} />
                    </div>
                  </div>

                  <div
                    className={cn(
                      "text-lg sm:text-xl md:text-2xl font-black tracking-tighter font-headline italic leading-none shrink-0",
                      t.type === "income"
                        ? "text-emerald-600"
                        : t.type === "expense"
                          ? "text-rose-600"
                          : "text-blue-600",
                      "text-right",
                    )}
                  >
                    {!isLoaded || (isPrivate && !disablePrivacyMode) ? (
                      <PrivacyBlur />
                    ) : (
                      <>
                        {t.type === "income"
                          ? "+"
                          : t.type === "expense"
                            ? "-"
                            : ""}
                        {formatCurrency(Math.abs(t.amount))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block overflow-x-auto rounded-[32px] border border-white/40 shadow-sm bg-white/20">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/10 hover:bg-transparent">
              <TableHead className="py-8 px-8 text-[11px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30">
                Data
              </TableHead>
              <TableHead className="py-8 text-[11px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30 w-[30%]">
                Descrição
              </TableHead>
              <TableHead className="py-8 text-[11px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30">
                Categoria
              </TableHead>
              <TableHead className="py-8 text-[11px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30">
                Conta
              </TableHead>
              <TableHead className="py-8 text-right text-[11px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30 pr-8 w-[180px]">
                Valor
              </TableHead>
              <TableHead className="py-8 text-center text-[11px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            // @ts-expect-error - pendencia estrutural a ser revisada
            {transactions.map((t, index) => (
              <TableRow
                key={t.id}
                className="group border-b border-white/5 hover:bg-white/60 transition-all duration-500"
              >
                <TableCell className="py-6 px-8">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-[#2D241E] font-inter italic">
                      {formatDate(t.date)}
                    </span>
                    <span className="text-[10px] font-black text-[#2D241E]/20 uppercase tracking-[0.15em] mt-1">
                      {new Date(t.date).toLocaleDateString("pt-BR", {
                        weekday: "long",
                        timeZone: "UTC",
                      })}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-700 shadow-sm border border-white/40",
                        t.type === "income"
                          ? "bg-emerald-50 text-emerald-600"
                          : t.type === "expense"
                            ? "bg-rose-50 text-rose-600"
                            : "bg-blue-50 text-blue-600",
                      )}
                    >
                      {t.type === "income" ? (
                        <TrendingUp size={18} />
                      ) : t.type === "expense" ? (
                        <TrendingDown size={18} />
                      ) : (
                        <ArrowRightLeft size={18} />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-base font-black text-[#2D241E] group-hover:text-[#ff6b7b] transition-colors duration-500 font-headline italic pr-1">
                        {t.description}
                      </span>
                      {t.isRecurring && (
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="h-5 px-2 border-purple-100 bg-purple-50 text-purple-600 text-[8px] font-black tracking-widest uppercase rounded-lg"
                          >
                            Fixo
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <Badge
                    variant="secondary"
                    className="px-4 py-1.5 rounded-xl bg-white/80 text-[#2D241E]/60 border-none font-black text-[10px] uppercase tracking-widest"
                  >
                    {t.category?.name || "Geral"}
                  </Badge>
                </TableCell>
                <TableCell className="py-6">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#2D241E]/10" />
                    <span className="text-[10px] font-black text-[#2D241E]/40 uppercase tracking-[0.1em] italic truncate max-w-[120px]">
                      {t.sourceAccountId
                        ? getAccountName(t.sourceAccountId)
                        : t.destinationAccountId
                          ? getAccountName(t.destinationAccountId)
                          : "---"}
                    </span>
                  </div>
                </TableCell>
                <TableCell
                  className={cn(
                    "py-6 text-right font-bold text-xl tracking-tighter pr-8 font-headline italic",
                    t.type === "income"
                      ? "text-emerald-600"
                      : t.type === "expense"
                        ? "text-rose-600"
                        : "text-blue-600",
                  )}
                >
                  {!isLoaded || (isPrivate && !disablePrivacyMode) ? (
                    <PrivacyBlur />
                  ) : (
                    <>
                      {t.type === "income"
                        ? "+"
                        : t.type === "expense"
                          ? "-"
                          : ""}
                      {formatCurrency(Math.abs(t.amount))}
                    </>
                  )}
                </TableCell>
                <TableCell className="py-6">
                  <div className="flex items-center justify-center gap-2 transition-all duration-300">
                    <EditTransactionDialog
                      transaction={t}
                      accounts={accounts}
                      goals={goals}
                      categories={categories}
                    />
                    <DeleteTransactionDialog transactionId={t.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
