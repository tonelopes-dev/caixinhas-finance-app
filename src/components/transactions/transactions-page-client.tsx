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
        <div className="space-y-2">
            <Button asChild variant="ghost" className="text-[#2D241E]/60 hover:text-[#ff6b7b] hover:bg-[#ff6b7b]/5 rounded-xl transition-all -ml-3">
                <Link href="/dashboard" className="flex items-center">
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    <span className="font-black uppercase tracking-widest text-[10px]">Voltar ao Dashboard</span>
                </Link>
            </Button>
            <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tight text-[#2D241E]">
                Transações
            </h1>
            <p className="text-[#2D241E]/50 font-medium text-sm">
                Acompanhe e gerencie seu fluxo financeiro completo.
            </p>
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
                    "relative group overflow-hidden bg-white/70 backdrop-blur-md rounded-[32px] p-6 border border-white/80 shadow-[0_15px_40px_rgba(45,36,30,0.06)] hover:shadow-[0_25px_60px_rgba(45,36,30,0.12)] transition-all duration-500 cursor-pointer",
                    typeFilter === 'all' && "ring-2 ring-[#ff6b7b] bg-white/90 scale-[1.02]"
                )}
                onClick={() => setTypeFilter('all')}
            >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Wallet className="h-16 w-16 text-[#2D241E]" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#2D241E]/50 mb-4">Saldo Líquido</p>
                <h3 className="text-3xl font-black text-[#2D241E] tracking-tighter mb-2">
                    {formatCurrency(summary.balance)}
                </h3>
                <div className="w-10 h-1 bg-[#2D241E]/10 rounded-full group-hover:w-20 transition-all duration-500" />
            </motion.div>

            {/* Income Card */}
            <motion.div 
                variants={summaryItemVariants(0.2)} 
                className={cn(
                    "relative group overflow-hidden bg-white/70 backdrop-blur-md rounded-[32px] p-6 border border-white/80 shadow-[0_15px_40px_rgba(45,36,30,0.06)] hover:shadow-[0_25px_60px_rgba(45,36,30,0.12)] transition-all duration-500 cursor-pointer",
                    typeFilter === 'income' && "ring-2 ring-green-500 bg-white/90 scale-[1.02]"
                )}
                onClick={() => setTypeFilter('income')}
            >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp className="h-16 w-16 text-green-600" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-green-600/60 mb-4">Total Entradas</p>
                <h3 className="text-3xl font-black text-green-600 tracking-tighter mb-2">
                    {formatCurrency(summary.income)}
                </h3>
                <div className="w-10 h-1 bg-green-500/10 rounded-full group-hover:w-20 transition-all duration-500" />
            </motion.div>

            {/* Expense Card */}
            <motion.div 
                variants={summaryItemVariants(0.3)} 
                className={cn(
                    "relative group overflow-hidden bg-white/70 backdrop-blur-md rounded-[32px] p-6 border border-white/80 shadow-[0_15px_40px_rgba(45,36,30,0.06)] hover:shadow-[0_25px_60px_rgba(45,36,30,0.12)] transition-all duration-500 cursor-pointer",
                    typeFilter === 'expense' && "ring-2 ring-[#ff6b7b] bg-white/90 scale-[1.02]"
                )}
                onClick={() => setTypeFilter('expense')}
            >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingDown className="h-16 w-16 text-[#ff6b7b]" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#ff6b7b]/60 mb-4">Total Saídas</p>
                <h3 className="text-3xl font-black text-[#ff6b7b] tracking-tighter mb-2">
                    {formatCurrency(summary.expenses)}
                </h3>
                <div className="w-10 h-1 bg-[#ff6b7b]/10 rounded-full group-hover:w-20 transition-all duration-500" />
            </motion.div>

            {/* Recurring Card */}
            <motion.div 
                variants={summaryItemVariants(0.4)} 
                className="relative group overflow-hidden bg-white/70 backdrop-blur-md rounded-[32px] p-6 border-2 border-transparent hover:border-purple-200/50 shadow-[0_15px_40px_rgba(45,36,30,0.06)] hover:shadow-[0_25px_60px_rgba(45,36,30,0.12)] hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col justify-between"
                onClick={() => router.push('/recurring')}
            >
                <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-700">
                    <Repeat className="h-24 w-24 text-purple-600" />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-xl bg-purple-100/50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                            <Repeat className="h-4 w-4" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-purple-600/60">Contas Fixas</p>
                    </div>
                    <h3 className="text-3xl font-black text-purple-600 tracking-tighter mb-2">
                        {recurringSummary.recurringCount + recurringSummary.installmentsCount}
                    </h3>
                    <p className="text-[10px] font-bold text-purple-600/30 group-hover:text-purple-600/50 transition-colors">
                        Recorrências e parcelamentos
                    </p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                    <div className="px-4 py-2 rounded-xl bg-purple-600/5 text-purple-600 text-[10px] font-black uppercase tracking-widest group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 flex items-center gap-2">
                        <span>Ver todos</span>
                        <ArrowRight className="h-3 w-3 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </motion.div>
        </div>
      </motion.div>

      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="relative"
      >
        <div className="bg-white/50 backdrop-blur-md rounded-[40px] border border-white/80 shadow-[0_20px_50px_rgba(45,36,30,0.08)] overflow-hidden">
            {/* Filter Bar */}
            <div className="p-6 md:p-8 border-b border-[#2D241E]/5 bg-white/30">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2D241E]/30" />
                        <Input 
                            placeholder="Buscar transação..."
                            className="pl-12 h-14 bg-white/50 border-white/80 rounded-2xl shadow-sm focus:ring-[#ff6b7b]/20 focus:border-[#ff6b7b]/30 transition-all font-medium text-[#2D241E]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#2D241E]/5 rounded-2xl border border-white/50">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40">Filtros</span>
                            <div className="h-4 w-[1px] bg-[#2D241E]/10 mx-1" />
                            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
                                <SelectTrigger className="h-9 border-0 bg-transparent shadow-none focus:ring-0 font-bold text-[#2D241E] gap-2 px-2">
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-[#2D241E]/5 shadow-2xl">
                                    <SelectItem value="all">Todos os Tipos</SelectItem>
                                    <SelectItem value="income">Entradas</SelectItem>
                                    <SelectItem value="expense">Saídas</SelectItem>
                                    <SelectItem value="transfer">Transferências</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            <Select value={monthFilter} onValueChange={setMonthFilter}>
                                <SelectTrigger className="h-9 border-0 bg-transparent shadow-none focus:ring-0 font-bold text-[#2D241E] gap-2 px-2">
                                    <SelectValue placeholder="Mês" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-[#2D241E]/5 shadow-2xl">
                                    {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            
                            <Select value={yearFilter} onValueChange={setYearFilter}>
                                <SelectTrigger className="h-9 border-0 bg-transparent shadow-none focus:ring-0 font-bold text-[#2D241E] gap-2 px-2">
                                    <SelectValue placeholder="Ano" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-[#2D241E]/5 shadow-2xl">
                                    <SelectItem value="all">Anos</SelectItem>
                                    {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            <CardContent className="p-0">
                {/* Mobile View */}
                <motion.div className="md:hidden divide-y divide-[#2D241E]/5" variants={containerVariants} initial="hidden" animate="visible">
                    {filteredTransactions.map(t => {
                        const typeInfo = getTypeDisplay(t.type);
                        const isIncome = t.type === 'income';
                        const isExpense = t.type === 'expense';
                        
                        return (
                            <motion.div variants={itemVariants} key={t.id} className="p-5 flex items-center gap-4 bg-white/20 hover:bg-white/40 transition-colors">
                                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-90", typeInfo.bgColor)}>
                                    <typeInfo.icon className={cn("h-6 w-6", typeInfo.color)}/>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <p className="font-bold text-[#2D241E] truncate pr-2">{t.description}</p>
                                        <p className={cn("font-black whitespace-nowrap text-right", 
                                            isIncome ? "text-green-600" : isExpense ? "text-[#ff6b7b]" : "text-[#2D241E]/60"
                                        )}>
                                            {isIncome ? '+' : isExpense ? '-' : ''}
                                            {formatCurrency(t.amount)}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.1em] text-[#2D241E]/40">
                                        <div className="flex items-center gap-2">
                                            <span>{formatDate(t.date)}</span>
                                            {t.category?.name && (
                                                <>
                                                    <div className="w-1 h-1 rounded-full bg-[#2D241E]/20" />
                                                    <span className="text-[#2D241E]/60">{t.category.name}</span>
                                                </>
                                            )}
                                        </div>
                                        {t.isRecurring && (
                                            <Badge variant="outline" className="h-5 px-1.5 border-purple-200 bg-purple-50 text-purple-700 text-[8px] font-black">FIXA</Badge>
                                        )}
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-[#2D241E]/5">
                                            <MoreHorizontal className="h-5 w-5 text-[#2D241E]/40" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-2xl border-[#2D241E]/5 shadow-2xl p-1">
                                        <EditTransactionDialog transaction={t as Transaction} accounts={allAccounts} goals={allGoals} categories={allCategories} />
                                        <DeleteTransactionDialog transactionId={t.id} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-[#2D241E]/5 hover:bg-transparent">
                                <TableHead className="w-[80px] text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40 pl-8">Status</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40">Descrição</TableHead>
                                <TableHead className="hidden lg:table-cell text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40">Categoria</TableHead>
                                <TableHead className="hidden lg:table-cell text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40">Origem/Destino</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40 text-center">Data</TableHead>
                                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40 pr-8">Valor</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransactions.map((t) => {
                                const typeInfo = getTypeDisplay(t.type);
                                const isIncome = t.type === 'income';
                                const isExpense = t.type === 'expense';

                                return (
                                    <motion.tr 
                                        variants={itemVariants} 
                                        key={t.id}
                                        className="group hover:bg-white/50 border-[#2D241E]/5 transition-colors"
                                    >
                                        <TableCell className="pl-8">
                                            <div className={cn("p-2.5 rounded-2xl w-fit shadow-sm", typeInfo.bgColor)}>
                                                <typeInfo.icon className={cn("h-4 w-4", typeInfo.color)}/>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="py-2">
                                                <p className="font-bold text-[#2D241E] text-base group-hover:text-[#ff6b7b] transition-colors">{t.description}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {t.isRecurring && (
                                                        <Badge variant="outline" className="h-5 px-2 border-purple-200 bg-purple-50 text-purple-700 text-[9px] font-black tracking-widest uppercase">Fixa</Badge>
                                                    )}
                                                    {t.isInstallment && (
                                                        <Badge variant="outline" className="h-5 px-2 border-blue-200 bg-blue-50 text-blue-700 text-[9px] font-black tracking-widest uppercase">
                                                            {t.installmentNumber}/{t.totalInstallments}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            <span className="inline-flex items-center px-3 py-1 rounded-xl bg-[#2D241E]/5 text-[11px] font-bold text-[#2D241E]/70 border border-white/50">
                                                {t.category?.name || 'Geral'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            <div className="space-y-1">
                                                {t.sourceAccountId && (
                                                    <div className='flex items-center gap-2 text-[11px] font-medium text-[#2D241E]/60'>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                        <span>{getAccountName(t.sourceAccountId)}</span>
                                                    </div>
                                                )}
                                                {t.destinationAccountId && (
                                                    <div className='flex items-center gap-2 text-[11px] font-medium text-[#2D241E]/60'>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                                        <span>{getAccountName(t.destinationAccountId)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center font-medium text-[#2D241E]/50 text-sm italic">
                                            {formatDate(t.date)}
                                        </TableCell>
                                        <TableCell className={cn("text-right font-black text-lg tracking-tight pr-8", 
                                            isIncome ? "text-green-600" : isExpense ? "text-[#ff6b7b]" : "text-[#2D241E]/80"
                                        )}>
                                            {isIncome ? '+' : isExpense ? '-' : ''}
                                            {formatCurrency(t.amount)}
                                        </TableCell>
                                        <TableCell className="pr-8 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-[#ff6b7b]/10 hover:text-[#ff6b7b]">
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-2xl border-[#2D241E]/5 shadow-2xl p-1 min-w-[150px]">
                                                    <EditTransactionDialog transaction={t as Transaction} accounts={allAccounts} goals={allGoals} categories={allCategories} />
                                                    <DeleteTransactionDialog transactionId={t.id} />
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </motion.tr>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>

                {filteredTransactions.length === 0 && (
                    <div className="py-32 text-center bg-white/20">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[30px] bg-[#2D241E]/5 mb-6">
                            <Search className="h-10 w-10 text-[#2D241E]/20" />
                        </div>
                        <p className="text-[#2D241E]/40 font-black italic tracking-widest uppercase text-xs">
                            Nenhuma transação encontrada
                        </p>
                    </div>
                )}
            </CardContent>
        </div>
      </motion.div>
    </>
  );
}
