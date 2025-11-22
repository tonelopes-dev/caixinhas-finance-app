
'use client';

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
import { TrendingDown, TrendingUp, Wallet, Landmark, ArrowRightLeft, Banknote, CreditCard, PiggyBank, MoreHorizontal, Search, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Transaction, Account, Goal } from '@/lib/definitions';
import { EditTransactionDialog } from '@/components/transactions/edit-transaction-dialog';
import { DeleteTransactionDialog } from '@/components/transactions/delete-transaction-dialog';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';

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
    pix: { label: 'Pix', icon: ArrowRightLeft },
    credit_card: { label: 'Crédito', icon: CreditCard },
    debit_card: { label: 'Débito', icon: CreditCard },
    transfer: { label: 'Transferência', icon: ArrowRightLeft },
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
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  
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
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mb-8"
      >
        <Card>
            <CardHeader>
                <CardTitle className='font-headline'>Resumo do Período</CardTitle>
                <CardDescription>Balanço de entradas e saídas para os filtros selecionados.</CardDescription>
            </CardHeader>
            <CardContent>
                <motion.div className="grid gap-4 md:grid-cols-4" initial="hidden" animate="visible" variants={containerVariants}>
                    <motion.div variants={summaryItemVariants(0.1)} className={cn(cardBaseClasses, typeFilter === 'all' && activeClasses)} onClick={() => setTypeFilter('all')}>
                        <div className="rounded-full bg-primary/10 p-3">
                            <Wallet className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Saldo Líquido</p>
                            <p className="text-xl font-bold">{formatCurrency(summary.balance)}</p>
                        </div>
                    </motion.div>
                    <motion.div variants={summaryItemVariants(0.2)} className={cn(cardBaseClasses, typeFilter === 'income' && activeClasses)} onClick={() => setTypeFilter('income')}>
                        <div className="rounded-full bg-green-500/10 p-3">
                            <TrendingUp className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Entradas</p>
                            <p className="text-xl font-bold">{formatCurrency(summary.income)}</p>
                        </div>
                    </motion.div>
                    <motion.div variants={summaryItemVariants(0.3)} className={cn(cardBaseClasses, typeFilter === 'expense' && activeClasses)} onClick={() => setTypeFilter('expense')}>
                        <div className="rounded-full bg-red-500/10 p-3">
                            <TrendingDown className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Saídas</p>
                            <p className="text-xl font-bold">{formatCurrency(summary.expenses)}</p>
                        </div>
                    </motion.div>
                    <motion.div variants={summaryItemVariants(0.4)} className={cardBaseClasses} onClick={() => router.push('/recurring')}>
                        <div className="rounded-full bg-purple-500/10 p-3">
                            <Repeat className="h-6 w-6 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Recorrentes e Parcelas</p>
                            <p className="text-xl font-bold">{recurringSummary.recurringCount + recurringSummary.installmentsCount}</p>
                        </div>
                    </motion.div>
                </motion.div>
            </CardContent>
        </Card>
      </motion.div>

      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
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
                  <span className='text-sm font-medium sr-only md:not-sr-only'>Filtros:</span>

                  <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
                    <SelectTrigger className="w-full md:w-auto">
                        <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
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
                        <SelectItem value="all">Todos</SelectItem>
                        {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div className="hidden md:block">
                      <AddTransactionDialog accounts={allAccounts} goals={allGoals} ownerId={workspaceId} categories={allCategories} />
                  </div>
                </div>
              </div>
          </CardHeader>
          <CardContent className='overflow-hidden p-0 md:p-6'>
              {/* Mobile View */}
              <motion.div className="space-y-4 md:hidden p-4" variants={containerVariants} initial="hidden" animate="visible">
                  {filteredTransactions.map(t => {
                      const typeInfo = getTypeDisplay(t.type);
                      const MethodIcon = t.paymentMethod ? paymentMethods[t.paymentMethod]?.icon : null;
                      return (
                          <motion.div variants={itemVariants} key={t.id} className="flex items-center gap-3 border-b pb-3 last:border-b-0">
                              <div className={cn("p-2 rounded-full", typeInfo.bgColor)}>
                                  <typeInfo.icon className={cn("h-5 w-5", typeInfo.color)}/>
                              </div>
                              <div className="flex-1 space-y-0.5">
                                  <div className="flex justify-between">
                                      <p className="font-medium">{t.description}</p>
                                      <p className={cn("font-medium", {
                                        'text-green-600': t.type === 'income',
                                        'text-red-500': t.type === 'expense',
                                        'text-muted-foreground': t.type === 'transfer'
                                      })}>
                                          {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}
                                          {formatCurrency(t.amount)}
                                      </p>
                                  </div>
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                      <span>{formatDate(t.date)}</span>
                                      <div className='flex items-center gap-2'>
                                            {t.isRecurring && (
                                                <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                                                    Recorrente
                                                </Badge>
                                            )}
                                            {t.isInstallment && (
                                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                                                    ({t.installmentNumber}/{t.totalInstallments})
                                                </Badge>
                                            )}
                                            {MethodIcon && (
                                                <div className='flex items-center gap-1'>
                                                    <MethodIcon className="h-3 w-3" />
                                                    <span>{paymentMethods[t.paymentMethod!].label}</span>
                                                </div>
                                            )}
                                      </div>
                                  </div>
                              </div>
                              <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                          <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                      <EditTransactionDialog transaction={t as Transaction} accounts={allAccounts} goals={allGoals} categories={allCategories} />
                                      <DeleteTransactionDialog transactionId={t.id} />
                                  </DropdownMenuContent>
                              </DropdownMenu>
                          </motion.div>
                      );
                  })}
              </motion.div>

              {/* Desktop View */}
              <Table className="hidden md:table">
              <TableHeader>
                  <TableRow>
                    <TableHead>Transação</TableHead>
                    <TableHead className="hidden lg:table-cell">Categoria</TableHead>
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
                                      <div>
                                          <p className="font-medium">{t.description}</p>
                                          <div className='flex items-center gap-2 text-muted-foreground text-xs'>
                                              {MethodIcon && (
                                                  <div className='flex items-center gap-1'>
                                                      <MethodIcon className="h-3 w-3" />
                                                      <span>{paymentMethods[t.paymentMethod!].label}</span>
                                                  </div>
                                              )}
                                              {t.isRecurring && (
                                                  <Badge variant="outline" className="border-purple-300 text-purple-800">
                                                      Recorrente
                                                  </Badge>
                                              )}
                                              {t.isInstallment && (
                                                  <Badge variant="outline" className="border-blue-300 text-blue-800">
                                                      Parcelado ({t.installmentNumber}/{t.totalInstallments})
                                                  </Badge>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                  <Badge variant="outline">{t.category?.name || 'Sem categoria'}</Badge>
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
                                  'text-red-500': t.type === 'expense',
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
                                          <EditTransactionDialog transaction={t as Transaction} accounts={allAccounts} goals={allGoals} categories={allCategories} />
                                          <DeleteTransactionDialog transactionId={t.id} />
                                      </DropdownMenuContent>
                                  </DropdownMenu>
                              </TableCell>
                          </motion.tr>
                      )
                  })}
              </motion.tbody>
              </Table>

               {filteredTransactions.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                      Nenhuma transação encontrada para os filtros selecionados.
                  </div>
              )}
          </CardContent>
          </Card>
      </motion.div>
      <div className="fixed bottom-6 right-6 md:hidden">
          <AddTransactionDialog accounts={allAccounts} goals={allGoals} ownerId={workspaceId} categories={allCategories} />
      </div>
    </>
  );
}
