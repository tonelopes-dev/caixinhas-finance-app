'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, TrendingDown, TrendingUp, Wallet, Landmark, 
  ArrowRight, Banknote, CreditCard, PiggyBank, MoreHorizontal, 
  Search, Repeat, ArrowRightLeft, Filter, Calendar, 
  ChevronDown, Plus, Download 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StandardBackButton } from '@/components/ui/standard-back-button';
import { ResponsiveTransactionList } from '@/components/transactions/responsive-transaction-list';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Transaction, Account, Goal } from '@/lib/definitions';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useLoading } from '@/components/providers/loading-provider';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

const months = [
    { value: 'all', label: 'Todos os meses' },
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', 'label': 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
];

const paymentMethods: Record<string, { label: string, icon: React.ElementType }> = {
    pix: { label: 'Pix', icon: ArrowRight },
    credit_card: { label: 'Crédito', icon: CreditCard },
    debit_card: { label: 'Débito', icon: CreditCard },
    transfer: { label: 'Transferência', icon: ArrowRight },
    boleto: { label: 'Boleto', icon: Banknote },
    cash: { label: 'Dinheiro', icon: Banknote },
}

const getTypeDisplay = (type: Transaction['type']) => {
    switch (type) {
        case 'income': return { label: 'Entrada', icon: TrendingUp, color: 'text-green-500', bgColor: 'bg-green-500/10' };
        case 'expense': return { label: 'Saída', icon: TrendingDown, color: 'text-red-500', bgColor: 'bg-red-500/10' };
        case 'transfer': return { label: 'Transferência', icon: ArrowRightLeft, color: 'text-blue-500', bgColor: 'bg-blue-500/10' };
    }
}

type TransactionsPageClientProps = {
  initialTransactions: any[];
  allAccounts: Account[];
  allGoals: Goal[];
  allCategories: any[];
  workspaceId: string;
};

export function TransactionsPageClient({
  initialTransactions,
  allAccounts,
  allGoals,
  allCategories,
  workspaceId,
}: TransactionsPageClientProps) {
  const router = useRouter();
  const { showLoading } = useLoading();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');

  const years = useMemo(() => {
      const currentYear = new Date().getFullYear();
      if (!initialTransactions || initialTransactions.length === 0) {
          return Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
      }
      
      const transactionYears = initialTransactions.map(t => new Date(t.date).getFullYear());
      const minYear = Math.min(...transactionYears, currentYear - 2); // Pelo menos 2 anos atrás
      const maxYear = Math.max(...transactionYears, currentYear + 1); // Pelo menos ano que vem
      
      const yearsList = [];
      for (let y = maxYear; y >= minYear; y--) {
        yearsList.push(y.toString());
      }
      return [...new Set(yearsList)]; // Remove duplicates
  }, [initialTransactions]);

  useEffect(() => {
    setMonthFilter((new Date().getMonth() + 1).toString());
    setYearFilter(new Date().getFullYear().toString());
  }, []);

  const getAccountName = (id: string) => {
    if (id.startsWith('goal')) {
        const goal = allGoals.find(g => g.id === id);
        return goal ? `Caixinha: ${goal.name}` : 'Caixinha';
    }
    const account = allAccounts.find(a => a.id === id);
    return account ? account.name : 'Conta desconhecida';
  }

  const filteredTransactions = useMemo(() => {
    return initialTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      
      const searchMatch = searchQuery === '' || 
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.amount.toString().includes(searchQuery);

      const typeMatch = typeFilter === 'all' || transaction.type === typeFilter;
      
      const monthMatch =
        monthFilter === 'all' ||
        transactionDate.getMonth() + 1 === parseInt(monthFilter);
      
      const yearMatch =
        yearFilter === 'all' ||
        transactionDate.getFullYear() === parseInt(yearFilter);
        
      return searchMatch && typeMatch && monthMatch && yearMatch;
    });
  }, [initialTransactions, searchQuery, typeFilter, monthFilter, yearFilter]);

  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const transfers = filteredTransactions
      .filter((t) => t.type === 'transfer')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;
    return { income, expenses, balance, transfers };
  }, [filteredTransactions]);

  const recurringSummary = useMemo(() => {
    const recurring = initialTransactions.filter(t => t.isRecurring);
    const installments = initialTransactions.filter(t => t.isInstallment);
    
    return {
      recurringCount: recurring.length,
      installmentsCount: installments.length
    };
  }, [initialTransactions]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { ease: 'easeOut', duration: 0.3 } },
  };

  const summaryItemVariants = (delay: number) => ({
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { ease: 'easeOut', duration: 0.5, delay } },
  });

  const cardBaseClasses = "cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center gap-4 rounded-lg border p-4";
  const activeClasses = "ring-2 ring-primary shadow-md scale-[1.02]";

  return (
    <>
      {/* Navigation & Header */}
      <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
            <StandardBackButton href="/dashboard" label="Voltar ao Dashboard" />
            <div>
              <h1 className="font-headline text-5xl md:text-6xl font-black tracking-tight text-[#2D241E] italic">
                  Transações
              </h1>
              <p className="text-[#2D241E]/40 font-bold text-lg mt-2 italic">
                  Acompanhe e gerencie seu fluxo financeiro completo.
              </p>
            </div>
        </div>
        
        <div className="flex items-center gap-4">
            <AddTransactionDialog 
                accounts={allAccounts} 
                goals={allGoals} 
                ownerId={workspaceId} 
                categories={allCategories} 
                className="h-16 px-10 text-lg font-black uppercase tracking-widest rounded-3xl shadow-2xl shadow-[#ff6b7b]/20 bg-gradient-to-br from-[#ff6b7b] via-[#fa8292] to-[#ff6b7b] hover:shadow-[#ff6b7b]/40 hover:-translate-y-1 transition-all duration-500"
            />
        </div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mb-14"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Net Balance Card */}
            <motion.div 
                variants={summaryItemVariants(0.1)} 
                className={cn(
                    "relative group overflow-hidden bg-white/40 backdrop-blur-3xl rounded-[40px] p-8 border border-white/60 shadow-[0_20px_50px_rgba(45,36,30,0.06)] hover:shadow-[0_30px_70px_rgba(45,36,30,0.1)] transition-all duration-700 cursor-pointer hover:-translate-y-2",
                    typeFilter === 'all' && "ring-4 ring-[#ff6b7b]/20 bg-white/80 shadow-[0_40px_80px_rgba(255,107,123,0.15)]"
                )}
                onClick={() => setTypeFilter('all')}
            >
                <div className="absolute -top-6 -right-6 p-8 opacity-5 group-hover:opacity-10 transition-all duration-1000 group-hover:scale-125 group-hover:rotate-12">
                    <Wallet className="h-24 w-24 text-[#2D241E]" />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={cn(
                                "p-3 rounded-2xl transition-all duration-500",
                                typeFilter === 'all' ? "bg-[#ff6b7b] text-white shadow-lg shadow-[#ff6b7b]/20" : "bg-white text-[#2D241E]/20"
                            )}>
                                <Wallet className="h-5 w-5" />
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#2D241E]/30 font-inter">Saldo Líquido</p>
                        </div>
                        <h3 className="text-4xl font-black text-[#2D241E] tracking-tighter mb-1 font-headline italic">
                            {formatCurrency(summary.balance)}
                        </h3>
                    </div>
                </div>
            </motion.div>

            {/* Income Card */}
            <motion.div 
                variants={summaryItemVariants(0.2)} 
                className={cn(
                    "relative group overflow-hidden bg-white/40 backdrop-blur-3xl rounded-[40px] p-8 border border-white/60 shadow-[0_20px_50px_rgba(45,36,30,0.06)] hover:shadow-[0_30px_70px_rgba(45,36,30,0.1)] transition-all duration-700 cursor-pointer hover:-translate-y-2",
                    typeFilter === 'income' && "ring-4 ring-emerald-500/20 bg-white/80 shadow-[0_40px_80px_rgba(16,185,129,0.15)]"
                )}
                onClick={() => setTypeFilter('income')}
            >
                <div className="absolute -top-6 -right-6 p-8 opacity-5 group-hover:opacity-10 transition-all duration-1000 group-hover:scale-125 group-hover:rotate-12">
                    <TrendingUp className="h-24 w-24 text-emerald-600" />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={cn(
                                "p-3 rounded-2xl transition-all duration-500",
                                typeFilter === 'income' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-emerald-50 text-emerald-600/40"
                            )}>
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-600/40 font-inter">Entradas</p>
                        </div>
                        <h3 className="text-4xl font-black text-emerald-600 tracking-tighter mb-1 font-headline italic">
                            {formatCurrency(summary.income)}
                        </h3>
                    </div>
                </div>
            </motion.div>

            {/* Expense Card */}
            <motion.div 
                variants={summaryItemVariants(0.3)} 
                className={cn(
                    "relative group overflow-hidden bg-white/40 backdrop-blur-3xl rounded-[40px] p-8 border border-white/60 shadow-[0_20px_50px_rgba(45,36,30,0.06)] hover:shadow-[0_30px_70px_rgba(45,36,30,0.1)] transition-all duration-700 cursor-pointer hover:-translate-y-2",
                    typeFilter === 'expense' && "ring-4 ring-[#ff6b7b]/20 bg-white/80 shadow-[0_40px_80px_rgba(255,107,123,0.15)]"
                )}
                onClick={() => setTypeFilter('expense')}
            >
                <div className="absolute -top-6 -right-6 p-8 opacity-5 group-hover:opacity-10 transition-all duration-1000 group-hover:scale-125 group-hover:rotate-12">
                    <TrendingDown className="h-24 w-24 text-[#ff6b7b]" />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={cn(
                                "p-3 rounded-2xl transition-all duration-500",
                                typeFilter === 'expense' ? "bg-[#ff6b7b] text-white shadow-lg shadow-[#ff6b7b]/20" : "bg-[#ff6b7b]/10 text-[#ff6b7b]/40"
                            )}>
                                <TrendingDown className="h-5 w-5" />
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#ff6b7b]/40 font-inter">Saídas</p>
                        </div>
                        <h3 className="text-4xl font-black text-[#ff6b7b] tracking-tighter mb-1 font-headline italic">
                            {formatCurrency(summary.expenses)}
                        </h3>
                    </div>
                </div>
            </motion.div>

            {/* Recurring Card */}
            <motion.div 
                variants={summaryItemVariants(0.4)} 
                className="relative group overflow-hidden bg-white/40 backdrop-blur-3xl rounded-[40px] p-8 border border-white/60 shadow-[0_20px_50px_rgba(45,36,30,0.06)] hover:shadow-[0_35px_80px_rgba(147,51,234,0.15)] hover:-translate-y-3 transition-all duration-1000 cursor-pointer flex flex-col justify-between"
                onClick={() => {
                    showLoading('Abrindo Contas Fixas...');
                    router.push('/recurring');
                }}
            >
                <div className="absolute -top-8 -right-8 p-10 opacity-5 group-hover:opacity-15 group-hover:scale-150 transition-all duration-1000 group-hover:rotate-12">
                    <Repeat className="h-32 w-32 text-purple-600" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-all duration-700 group-hover:rotate-[360deg] group-hover:shadow-lg group-hover:shadow-purple-500/20">
                            <Repeat className="h-5 w-5" />
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-purple-600/40 font-inter">Contas Fixas</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-4xl font-black text-purple-600 tracking-tighter font-headline italic">
                            {recurringSummary.recurringCount + recurringSummary.installmentsCount}
                        </h3>
                        <span className="text-[10px] font-black text-purple-600/30 uppercase tracking-[0.2em]">Ativas</span>
                    </div>
                </div>
                <div className="relative z-10 mt-8 pt-6 border-t border-purple-100/50">
                    <div className="flex items-center justify-between text-purple-600">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em]">Painel de Controle</span>
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all duration-700 shadow-sm">
                            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
                {/* Status Indicator */}
                <div className="absolute top-6 right-6 h-2.5 w-2.5 rounded-full bg-purple-400 animate-pulse pointer-events-none shadow-[0_0_10px_rgba(167,139,250,0.5)]" />
            </motion.div>
        </div>
      </motion.div>

      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="relative"
      >
        <div className="bg-white/40 backdrop-blur-xl rounded-[40px] border border-white/40 shadow-[0_20px_50px_rgba(45,36,30,0.06)] overflow-hidden transition-all duration-500 hover:shadow-[0_30px_70px_rgba(45,36,30,0.1)]">
            {/* Filter Bar */}
            <div className="p-8 md:p-12 border-b border-white/20 bg-white/20">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                    <div className="relative flex-1 max-w-2xl group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-[#2D241E]/20 group-focus-within:text-[#ff6b7b] transition-all duration-500" />
                        <Input 
                            placeholder="Pesquisar por descrição ou valor..."
                            className="pl-16 h-20 bg-white/40 border-white/40 rounded-[28px] shadow-sm focus:ring-[#ff6b7b]/10 focus:border-[#ff6b7b]/30 transition-all font-bold text-[#2D241E] text-xl placeholder:text-[#2D241E]/15 placeholder:italic"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-500">
                             <div className="px-2 py-1 rounded-md bg-[#2D241E]/5 text-[10px] font-black text-[#2D241E]/30 uppercase tracking-widest">ESC para limpar</div>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-5">
                        <div className="flex flex-wrap items-center gap-3 p-2 bg-white/30 rounded-[32px] border border-white/60 shadow-inner">
                            <div className="px-5 py-2 flex items-center gap-3">
                                <Filter size={16} className="text-[#2D241E]/30" />
                                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#2D241E]/30">Refinar</span>
                            </div>
                            
                            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
                                <SelectTrigger className="h-14 border-none bg-white/60 hover:bg-white rounded-2xl shadow-sm focus:ring-4 focus:ring-[#ff6b7b]/5 font-black text-[#2D241E] gap-3 px-6 transition-all min-w-[160px]">
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent className="rounded-[28px] border-white/40 shadow-2xl backdrop-blur-3xl bg-[#fdfcf7]/95 p-2">
                                    <SelectItem value="all" className="font-black rounded-xl py-3">Todos</SelectItem>
                                    <SelectItem value="income" className="font-black text-emerald-600 rounded-xl py-3">Entradas</SelectItem>
                                    <SelectItem value="expense" className="font-black text-[#ff6b7b] rounded-xl py-3">Saídas</SelectItem>
                                    <SelectItem value="transfer" className="font-black text-blue-600 rounded-xl py-3">Transferências</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            <Select value={monthFilter} onValueChange={setMonthFilter}>
                                <SelectTrigger className="h-14 border-none bg-white/60 hover:bg-white rounded-2xl shadow-sm focus:ring-4 focus:ring-[#ff6b7b]/5 font-black text-[#2D241E] gap-3 px-6 transition-all min-w-[180px]">
                                    <Calendar className="h-4 w-4 text-[#2D241E]/30" />
                                    <SelectValue placeholder="Mês" />
                                </SelectTrigger>
                                <SelectContent className="rounded-[28px] border-white/40 shadow-2xl backdrop-blur-3xl bg-[#fdfcf7]/95 p-2 max-h-[400px]">
                                    {months.map(m => <SelectItem key={m.value} value={m.value} className="font-black rounded-xl py-3">{m.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            
                            <Select value={yearFilter} onValueChange={setYearFilter}>
                                <SelectTrigger className="h-14 border-none bg-white/60 hover:bg-white rounded-2xl shadow-sm focus:ring-4 focus:ring-[#ff6b7b]/5 font-black text-[#2D241E] gap-3 px-6 transition-all">
                                    <SelectValue placeholder="Ano" />
                                </SelectTrigger>
                                <SelectContent className="rounded-[28px] border-white/40 shadow-2xl backdrop-blur-3xl bg-[#fdfcf7]/95 p-2">
                                    {years.map(y => <SelectItem key={y} value={y} className="font-black text-center rounded-xl py-3">{y}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-0">
                <ResponsiveTransactionList 
                    transactions={filteredTransactions}
                    accounts={allAccounts}
                    goals={allGoals}
                    categories={allCategories}
                    disablePrivacyMode={true}
                    emptyState={
                        <div className="py-24 text-center text-[#2D241E]/20 space-y-8">
                            <div className="p-10 bg-white/30 w-fit mx-auto rounded-[48px] border border-white/50">
                                <Search size={56} className="animate-pulse" />
                            </div>
                            <div className="space-y-3">
                                <p className="font-black text-2xl tracking-tight text-[#2D241E]/40 font-headline italic">Nenhuma transação encontrada</p>
                                <p className="text-sm font-bold uppercase tracking-widest opacity-60">Ajuste seus filtros e tente novamente</p>
                            </div>
                        </div>
                    }
                />
            </div>
        </div>
      </motion.div>
    </>
  );
}
