
'use client';

import Link from 'next/link';
import { ArrowLeft, ListFilter, ArrowRight, Banknote, CreditCard, PiggyBank, MoreHorizontal, Edit, Trash2, Search } from 'lucide-react';
import { transactions as allTransactions, accounts as allAccounts, goals as allGoals, users } from '@/lib/data';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { AddTransactionSheet } from '@/components/dashboard/add-transaction-sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingDown, TrendingUp, Wallet, Landmark, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Transaction, Account, Goal } from '@/lib/definitions';
import { EditTransactionSheet } from '@/components/transactions/edit-transaction-sheet';
import { DeleteTransactionDialog } from '@/components/transactions/delete-transaction-dialog';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
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
        case 'transfer': return { label: 'Transferência', icon: ArrowRight, color: 'text-blue-500', bgColor: 'bg-blue-500/10' };
    }
}


export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    const selectedWorkspaceId = sessionStorage.getItem('CAIXINHAS_VAULT_ID');
    const userId = localStorage.getItem('CAIXINHAS_USER_ID');

    if (!userId || !selectedWorkspaceId) {
      router.push('/login');
      return;
    }
    setWorkspaceId(selectedWorkspaceId);

    const isPersonal = selectedWorkspaceId === userId;
    const ownerType = isPersonal ? 'user' : 'vault';

    setTransactions(allTransactions.filter(t => t.ownerId === selectedWorkspaceId && t.ownerType === ownerType));
    
    // Na página de transações, precisamos de TODAS as contas e metas para resolver os nomes
    setAccounts(allAccounts);
    setGoals(allGoals);

    // Set filters to current month and year on initial load
    setMonthFilter((new Date().getMonth() + 1).toString());
    setYearFilter(new Date().getFullYear().toString());


  }, [router]);

  const getAccountName = (id: string) => {
    if (id.startsWith('goal')) {
        const goal = goals.find(g => g.id === id);
        return goal ? `Caixinha: ${goal.name}` : 'Caixinha';
    }
    const account = accounts.find(a => a.id === id);
    return account ? account.name : 'Conta desconhecida';
  }


  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
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
  }, [transactions, searchQuery, typeFilter, monthFilter, yearFilter]);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 1.5,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        ease: 'easeOut',
        duration: 0.5,
      },
    },
  };

  const summaryItemVariants = (delay: number) => ({
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        ease: 'easeOut',
        duration: 0.5,
        delay,
      },
    },
  });

  const cardBaseClasses = "cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center gap-4 rounded-lg border p-4";
  const activeClasses = "ring-2 ring-primary shadow-md scale-[1.02]";

  if (!workspaceId) {
     return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }


  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-6xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Painel
          </Link>
        </Button>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Card className="mb-8">
              <CardHeader>
                  <CardTitle className='font-headline'>Resumo do Período</CardTitle>
                  <CardDescription>Balanço de entradas e saídas para os filtros selecionados.</CardDescription>
              </CardHeader>
              <CardContent>
                  <motion.div className="grid gap-4 md:grid-cols-3" initial="hidden" animate="visible" variants={containerVariants}>
                      {typeFilter === 'transfer' ? (
                         <motion.div variants={summaryItemVariants(0.5)} className={cn(cardBaseClasses, typeFilter === 'transfer' && activeClasses)} onClick={() => setTypeFilter('transfer')}>
                            <div className="rounded-full bg-blue-500/10 p-3">
                                <ArrowRightLeft className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Movimentado</p>
                                <p className="text-xl font-bold">{formatCurrency(summary.transfers)}</p>
                            </div>
                        </motion.div>
                      ) : (
                        <motion.div variants={summaryItemVariants(0.5)} className={cn(cardBaseClasses, typeFilter === 'all' && activeClasses)} onClick={() => setTypeFilter('all')}>
                            <div className="rounded-full bg-primary/10 p-3">
                                <Wallet className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Saldo Líquido</p>
                                <p className="text-xl font-bold">{formatCurrency(summary.balance)}</p>
                            </div>
                        </motion.div>
                      )}
                      <motion.div variants={summaryItemVariants(0.6)} className={cn(cardBaseClasses, typeFilter === 'income' && activeClasses)} onClick={() => setTypeFilter('income')}>
                          <div className="rounded-full bg-green-500/10 p-3">
                              <TrendingUp className="h-6 w-6 text-green-500" />
                          </div>
                          <div>
                              <p className="text-sm text-muted-foreground">Entradas</p>
                              <p className="text-xl font-bold">{formatCurrency(summary.income)}</p>
                          </div>
                      </motion.div>
                      <motion.div variants={summaryItemVariants(0.7)} className={cn(cardBaseClasses, typeFilter === 'expense' && activeClasses)} onClick={() => setTypeFilter('expense')}>
                          <div className="rounded-full bg-red-500/10 p-3">
                              <TrendingDown className="h-6 w-6 text-red-500" />
                          </div>
                          <div>
                              <p className="text-sm text-muted-foreground">Saídas</p>
                              <p className="text-xl font-bold">{formatCurrency(summary.expenses)}</p>
                          </div>
                      </motion.div>
                  </motion.div>
              </CardContent>
          </Card>
        </motion.div>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.5 }}
        >
            <Card>
            <CardHeader>
                <div>
                <CardTitle className="font-headline text-2xl">
                    Histórico de Transações
                </CardTitle>
                <CardDescription>
                    Seu histórico financeiro completo e detalhado.
                </CardDescription>
                </div>
                <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center">
                  <div className='relative flex-1'>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar por nome ou valor..."
                      className="pl-10 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <ListFilter className="h-5 w-5 text-muted-foreground" />
                    <span className='text-sm font-medium sr-only md:not-sr-only'>Filtros:</span>

                    <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
                      <SelectTrigger className="w-full md:w-auto">
                          <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">Todos os Tipos</SelectItem>
                          <SelectItem value="income">Entradas</SelectItem>
                          <SelectItem value="expense">Saídas</SelectItem>
                          <SelectItem value="transfer">Transferências</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={monthFilter} onValueChange={setMonthFilter}>
                      <SelectTrigger className="w-full md:w-auto">
                          <SelectValue placeholder="Mês" />
                      </SelectTrigger>
                      <SelectContent>
                          {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={yearFilter} onValueChange={setYearFilter}>
                      <SelectTrigger className="w-full md:w-auto">
                          <SelectValue placeholder="Ano" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">Todos os Anos</SelectItem>
                          {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <AddTransactionSheet accounts={accounts} />
                  </div>
                </div>
            </CardHeader>
            <CardContent className='overflow-hidden'>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Transação</TableHead>
                    <TableHead className="hidden md:table-cell">Categoria</TableHead>
                    <TableHead className="hidden lg:table-cell">Contas</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <motion.tbody
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {filteredTransactions.map((t) => {
                        const typeInfo = getTypeDisplay(t.type);
                        const MethodIcon = t.paymentMethod ? paymentMethods[t.paymentMethod!]?.icon : null;

                        return (
                            <motion.tr variants={itemVariants} key={t.id}>
                                <TableCell>
                                    <div className='flex items-center gap-3'>
                                        <div className={cn("p-2 rounded-full", typeInfo.bgColor)}>
                                            <typeInfo.icon className={cn("h-4 w-4", typeInfo.color)}/>
                                        </div>
                                        <div className='flex-1'>
                                            <p className="font-medium">{t.description}</p>
                                            <div className='flex items-center gap-2 text-muted-foreground text-xs'>
                                                {MethodIcon && (
                                                    <div className='flex items-center gap-1'>
                                                        <MethodIcon className="h-3 w-3" />
                                                        <span>{paymentMethods[t.paymentMethod!].label}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <Badge variant="outline">{t.category}</Badge>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell text-xs">
                                    {t.sourceAccountId && (
                                        <div className='flex items-center gap-1 text-muted-foreground'>
                                            <Landmark className="h-3 w-3 text-red-500" />
                                            <span>{getAccountName(t.sourceAccountId)}</span>
                                        </div>

                                    )}
                                    {t.destinationAccountId && (
                                        <div className='flex items-center gap-1 text-muted-foreground mt-1'>
                                            {t.destinationAccountId.startsWith('goal') ? <PiggyBank className="h-3 w-3 text-green-500"/> : <Landmark className="h-3 w-3 text-green-500" />}
                                            <span>{getAccountName(t.destinationAccountId)}</span>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>{formatDate(t.date)}</TableCell>
                                <TableCell className={cn("text-right font-medium", {
                                    'text-green-600': t.type === 'income',
                                    'text-foreground': t.type === 'expense',
                                    'text-muted-foreground': t.type === 'transfer'
                                })}>
                                    {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}
                                    {formatCurrency(t.amount)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <EditTransactionSheet transaction={t} />
                                            <DeleteTransactionDialog transactionId={t.id} />
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </motion.tr>
                        )
                    })}
                    {filteredTransactions.length === 0 && (
                    <TableRow>
                        <TableCell
                        colSpan={6}
                        className="py-8 text-center text-muted-foreground"
                        >
                        Nenhuma transação encontrada para os filtros selecionados.
                        </TableCell>
                    </TableRow>
                    )}
                </motion.tbody>
                </Table>
            </CardContent>
            </Card>
        </motion.div>
      </div>
    </div>
  );
}


    

    
