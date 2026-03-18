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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
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
import { EditTransactionDialog } from '@/components/transactions/edit-transaction-dialog';
import { DeleteTransactionDialog } from '@/components/transactions/delete-transaction-dialog';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

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
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
            <StandardBackButton href="/dashboard" label="Voltar ao Dashboard" />
            <div>
              <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tight text-[#2D241E]">
                  Transações
              </h1>
              <p className="text-[#2D241E]/50 font-medium text-sm mt-1">
                  Acompanhe e gerencie seu fluxo financeiro completo.
              </p>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <AddTransactionDialog 
                accounts={allAccounts} 
                goals={allGoals} 
                ownerId={workspaceId} 
                categories={allCategories} 
                className="shadow-lg shadow-[#ff6b7b]/20"
            />
        </div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mb-14"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Net Balance Card */}
            <motion.div 
                variants={summaryItemVariants(0.1)} 
                className={cn(
                    "relative group overflow-hidden bg-white/40 backdrop-blur-xl rounded-[32px] p-6 border border-white/40 shadow-[0_8px_32px_rgba(45,36,30,0.05)] hover:shadow-[0_16px_48px_rgba(45,36,30,0.1)] transition-all duration-500 cursor-pointer hover:-translate-y-1",
                    typeFilter === 'all' && "ring-2 ring-[#ff6b7b]/50 bg-white/60 shadow-[0_20px_60px_rgba(255,107,123,0.15)]"
                )}
                onClick={() => setTypeFilter('all')}
            >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6">
                    <Wallet className="h-16 w-16 text-[#2D241E]" />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2.5 rounded-2xl bg-white/50 text-[#2D241E] shadow-sm">
                                <Wallet className="h-4 w-4" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40">Saldo Líquido</p>
                        </div>
                        <h3 className="text-3xl font-black text-[#2D241E] tracking-tighter mb-1">
                            {formatCurrency(summary.balance)}
                        </h3>
                    </div>
                </div>
            </motion.div>

            {/* Income Card */}
            <motion.div 
                variants={summaryItemVariants(0.2)} 
                className={cn(
                    "relative group overflow-hidden bg-white/40 backdrop-blur-xl rounded-[32px] p-6 border border-white/40 shadow-[0_8px_32px_rgba(45,36,30,0.05)] hover:shadow-[0_16px_48px_rgba(45,36,30,0.1)] transition-all duration-500 cursor-pointer hover:-translate-y-1",
                    typeFilter === 'income' && "ring-2 ring-emerald-500/50 bg-white/60 shadow-[0_20px_60px_rgba(16,185,129,0.15)]"
                )}
                onClick={() => setTypeFilter('income')}
            >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6">
                    <TrendingUp className="h-16 w-16 text-emerald-600" />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/60 font-inter">Entradas</p>
                        </div>
                        <h3 className="text-3xl font-black text-emerald-600 tracking-tighter mb-1">
                            {formatCurrency(summary.income)}
                        </h3>
                    </div>
                </div>
            </motion.div>

            {/* Expense Card */}
            <motion.div 
                variants={summaryItemVariants(0.3)} 
                className={cn(
                    "relative group overflow-hidden bg-white/40 backdrop-blur-xl rounded-[32px] p-6 border border-white/40 shadow-[0_8px_32px_rgba(45,36,30,0.05)] hover:shadow-[0_16px_48px_rgba(45,36,30,0.1)] transition-all duration-500 cursor-pointer hover:-translate-y-1",
                    typeFilter === 'expense' && "ring-2 ring-[#ff6b7b]/50 bg-white/60 shadow-[0_20px_60px_rgba(255,107,123,0.15)]"
                )}
                onClick={() => setTypeFilter('expense')}
            >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6">
                    <TrendingDown className="h-16 w-16 text-[#ff6b7b]" />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2.5 rounded-2xl bg-[#ff6b7b]/10 text-[#ff6b7b] shadow-sm transition-colors group-hover:bg-[#ff6b7b] group-hover:text-white">
                                <TrendingDown className="h-4 w-4" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff6b7b]/60 font-inter">Saídas</p>
                        </div>
                        <h3 className="text-3xl font-black text-[#ff6b7b] tracking-tighter mb-1">
                            {formatCurrency(summary.expenses)}
                        </h3>
                    </div>
                </div>
            </motion.div>

            {/* Recurring Card (Link to /recurring) */}
            <motion.div 
                variants={summaryItemVariants(0.4)} 
                className="relative group overflow-hidden bg-white/40 backdrop-blur-xl rounded-[32px] p-6 border border-white/40 shadow-[0_8px_32px_rgba(45,36,30,0.05)] hover:shadow-[0_25px_60px_rgba(147,51,234,0.12)] hover:-translate-y-2 transition-all duration-700 cursor-pointer flex flex-col justify-between"
                onClick={() => router.push('/recurring')}
            >
                <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-1000">
                    <Repeat className="h-24 w-24 text-purple-600" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-all duration-500 group-hover:rotate-[360deg]">
                            <Repeat className="h-4 w-4" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600/60 font-inter">Contas Fixas</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-purple-600 tracking-tighter">
                            {recurringSummary.recurringCount + recurringSummary.installmentsCount}
                        </h3>
                        <span className="text-[10px] font-black text-purple-600/30 uppercase tracking-widest">Ativas</span>
                    </div>
                </div>
                <div className="relative z-10 mt-6 pt-4 border-t border-purple-100/50">
                    <div className="flex items-center justify-between text-purple-600">
                        <span className="text-[9px] font-black uppercase tracking-[2px]">Gerenciar Tudo</span>
                        <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                            <ArrowRight className="h-3 w-3 transform group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </div>
                </div>
                {/* Status Indicator */}
                <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-purple-400 animate-pulse pointer-events-none" />
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
            <div className="p-6 md:p-10 border-b border-white/20 bg-white/20">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="relative flex-1 max-w-xl group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2D241E]/30 group-focus-within:text-[#ff6b7b] transition-colors" />
                        <Input 
                            placeholder="Buscar transação por descrição ou valor..."
                            className="pl-14 h-16 bg-white/40 border-white/60 rounded-[20px] shadow-sm focus:ring-[#ff6b7b]/10 focus:border-[#ff6b7b]/30 transition-all font-medium text-[#2D241E] text-lg placeholder:text-[#2D241E]/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/30 rounded-[24px] border border-white/60 shadow-inner">
                            <div className="px-4 py-2 flex items-center gap-2">
                                <Filter size={14} className="text-[#2D241E]/40" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40">Filtros</span>
                            </div>
                            
                            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
                                <SelectTrigger className="h-11 border-none bg-white/50 hover:bg-white rounded-xl shadow-sm focus:ring-0 font-bold text-[#2D241E] gap-2 px-4 transition-all">
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-white/40 shadow-2xl backdrop-blur-xl bg-white/90">
                                    <SelectItem value="all" className="font-bold">Todos os Tipos</SelectItem>
                                    <SelectItem value="income" className="font-bold text-emerald-600">Entradas</SelectItem>
                                    <SelectItem value="expense" className="font-bold text-[#ff6b7b]">Saídas</SelectItem>
                                    <SelectItem value="transfer" className="font-bold text-blue-600">Transferências</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            <Select value={monthFilter} onValueChange={setMonthFilter}>
                                <SelectTrigger className="h-11 border-none bg-white/50 hover:bg-white rounded-xl shadow-sm focus:ring-0 font-bold text-[#2D241E] gap-2 px-4 transition-all">
                                    <Calendar className="h-4 w-4 text-[#2D241E]/40" />
                                    <SelectValue placeholder="Mês" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-white/40 shadow-2xl backdrop-blur-xl bg-white/90 max-h-[300px]">
                                    {months.map(m => <SelectItem key={m.value} value={m.value} className="font-bold">{m.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            
                            <Select value={yearFilter} onValueChange={setYearFilter}>
                                <SelectTrigger className="h-11 border-none bg-white/50 hover:bg-white rounded-xl shadow-sm focus:ring-0 font-bold text-[#2D241E] gap-2 px-4 transition-all">
                                    <SelectValue placeholder="Ano" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-white/40 shadow-2xl backdrop-blur-xl bg-white/90">
                                    <SelectItem value="all" className="font-bold">Anos</SelectItem>
                                    {years.map(y => <SelectItem key={y} value={y} className="font-bold text-center">{y}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-0">
                {/* Mobile View */}
                <div className="md:hidden space-y-4 p-4">
                    {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((t) => (
                            <div key={t.id} className="bg-white/40 backdrop-blur-xl rounded-[32px] p-6 border border-white/60 shadow-[0_4px_20px_rgba(45,36,30,0.03)] active:scale-[0.98] transition-all duration-300">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm",
                                            t.type === 'income' ? "bg-emerald-50 text-emerald-600" : 
                                            t.type === 'expense' ? "bg-[#ff6b7b]/10 text-[#ff6b7b]" : 
                                            "bg-blue-50 text-blue-600"
                                        )}>
                                            {t.type === 'income' ? <TrendingUp size={20} /> : 
                                             t.type === 'expense' ? <TrendingDown size={20} /> : 
                                             <ArrowRightLeft size={20} />}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-[#2D241E] text-base leading-tight truncate">{t.description}</h4>
                                            <p className="text-[10px] font-black text-[#2D241E]/30 uppercase tracking-[0.2em] mt-1.5">
                                                {formatDate(t.date)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <EditTransactionDialog transaction={t as Transaction} accounts={allAccounts} goals={allGoals} categories={allCategories} />
                                        <DeleteTransactionDialog transactionId={t.id} />
                                    </div>
                                </div>
                                
                                <div className="flex items-end justify-between mt-8">
                                    <div className="space-y-3">
                                        <Badge variant="secondary" className="bg-white/60 text-[#2D241E]/60 border-none font-bold text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-xl shadow-sm">
                                            {t.category?.name || 'Geral'}
                                        </Badge>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-[#2D241E]/40 ml-1 uppercase tracking-widest">
                                            <div className="h-1.5 w-1.5 rounded-full bg-[#2D241E]/20" />
                                            <span>
                                                {t.sourceAccountId ? getAccountName(t.sourceAccountId) : 
                                                 t.destinationAccountId ? getAccountName(t.destinationAccountId) : '---'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "text-2xl font-black tracking-tighter",
                                        t.type === 'income' ? "text-emerald-600" : 
                                        t.type === 'expense' ? "text-[#ff6b7b]" : 
                                        "text-blue-600"
                                    )}>
                                        {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}{formatCurrency(t.amount)}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center text-[#2D241E]/20 space-y-6">
                            <div className="p-8 bg-white/30 w-fit mx-auto rounded-[32px] border border-white/50">
                                <Search size={48} className="animate-pulse" />
                            </div>
                            <div className="space-y-2">
                                <p className="font-black text-xl tracking-tight text-[#2D241E]/40">Nenhuma transação</p>
                                <p className="text-xs font-bold uppercase tracking-widest">Ajuste seus filtros</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-white/10 hover:bg-transparent">
                                    <TableHead className="py-8 px-10 text-[11px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40">Data</TableHead>
                                    <TableHead className="py-8 text-[11px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40">Descrição</TableHead>
                                    <TableHead className="py-8 text-[11px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40">Categoria</TableHead>
                                    <TableHead className="py-8 text-[11px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40">Conta</TableHead>
                                    <TableHead className="py-8 text-right text-[11px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40 pr-10">Valor</TableHead>
                                    <TableHead className="py-8 text-center text-[11px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((t) => (
                                        <TableRow 
                                            key={t.id} 
                                            className="group border-b border-white/5 hover:bg-white/40 transition-all duration-300"
                                        >
                                            <TableCell className="py-6 px-10">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-[#2D241E]">{formatDate(t.date)}</span>
                                                    <span className="text-[10px] font-black text-[#2D241E]/30 uppercase tracking-[0.1em] mt-0.5">
                                                        {new Date(t.date).toLocaleDateString('pt-BR', { weekday: 'long' })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:rotate-[360deg] shadow-sm",
                                                        t.type === 'income' ? "bg-emerald-50 text-emerald-600" : 
                                                        t.type === 'expense' ? "bg-[#ff6b7b]/10 text-[#ff6b7b]" : 
                                                        "bg-blue-50 text-blue-600"
                                                    )}>
                                                        {t.type === 'income' ? <TrendingUp size={16} /> : 
                                                         t.type === 'expense' ? <TrendingDown size={16} /> : 
                                                         <ArrowRightLeft size={16} />}
                                                    </div>
                                                    <div>
                                                        <span className="text-base font-bold text-[#2D241E] group-hover:text-[#ff6b7b] transition-colors duration-300">{t.description}</span>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {t.isRecurring && (
                                                                <Badge variant="outline" className="h-5 px-2 border-purple-100 bg-purple-50 text-purple-600 text-[8px] font-black tracking-widest uppercase rounded-lg">Fixo</Badge>
                                                            )}
                                                            {t.isInstallment && (
                                                                <Badge variant="outline" className="h-5 px-2 border-blue-100 bg-blue-50 text-blue-600 text-[8px] font-black tracking-widest uppercase rounded-lg">
                                                                    {t.installmentNumber}/{t.totalInstallments}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-6">
                                                <Badge variant="secondary" className="px-4 py-1.5 rounded-xl bg-white/60 text-[#2D241E]/60 border-none font-bold text-[10px] uppercase tracking-widest shadow-sm">
                                                    {t.category?.name || 'Geral'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-6">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-2 w-2 rounded-full bg-[#2D241E]/10" />
                                                    <span className="text-[11px] font-bold text-[#2D241E]/40 uppercase tracking-widest">
                                                        {t.sourceAccountId ? getAccountName(t.sourceAccountId) : 
                                                         t.destinationAccountId ? getAccountName(t.destinationAccountId) : '---'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className={cn(
                                                "py-6 text-right font-black text-xl tracking-tighter pr-10",
                                                t.type === 'income' ? "text-emerald-600" : 
                                                t.type === 'expense' ? "text-[#ff6b7b]" : 
                                                "text-blue-600"
                                            )}>
                                                {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}{formatCurrency(t.amount)}
                                            </TableCell>
                                            <TableCell className="py-6">
                                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                    <EditTransactionDialog 
                                                        transaction={t as Transaction} 
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
                                        <TableCell colSpan={6} className="h-80 text-center">
                                            <div className="flex flex-col items-center justify-center gap-6 text-[#2D241E]/20">
                                                <div className="p-8 bg-white/30 rounded-[40px] border border-white/50">
                                                    <Search size={64} className="animate-pulse" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-black text-2xl tracking-tight text-[#2D241E]/30">Nenhum resultado</p>
                                                    <p className="text-sm font-bold uppercase tracking-widest">Tente usar outros filtros ou termos de busca</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
      </motion.div>
    </>
  );
}
