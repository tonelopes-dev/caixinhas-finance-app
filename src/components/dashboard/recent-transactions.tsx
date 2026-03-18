'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Transaction, Account, Goal } from '@/lib/definitions';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListFilter, ArrowRight, Wallet, PlusCircle, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '../ui/animated-counter';
import { usePrivacyMode } from '@/hooks/use-privacy-mode';

type RecentTransactionsProps = {
  transactions: Transaction[];
  accounts: Account[];
  goals: Goal[];
  categories: any[];
  ownerId: string;
  ownerType: 'user' | 'vault';
  typeFilter: 'all' | 'income' | 'expense' | 'transfer';
  onFilterChange: (filter: 'all' | 'income' | 'expense' | 'transfer') => void;
};

export default function RecentTransactions({ 
  transactions, 
  accounts, 
  goals, 
  categories, 
  ownerId, 
  ownerType, 
  typeFilter, 
  onFilterChange 
}: RecentTransactionsProps) {

    const baseTransactions = useMemo(() => {
        // Sort by most recent
        return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        if (typeFilter === 'all') {
            return baseTransactions;
        }
        return baseTransactions.filter((transaction) => transaction.type === typeFilter);
    }, [baseTransactions, typeFilter]);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
    }

    const { isPrivate, isLoaded } = usePrivacyMode();
    const PrivacyBlur = () => <span className="text-xl font-black tracking-tighter text-[#2D241E]/30">R$ •••</span>;

  return (
    <Card className="border-none bg-white shadow-[0_20px_50px_rgba(45,36,30,0.08)] rounded-[32px] overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <CardTitle className="font-headline text-3xl font-bold tracking-tight text-[#2D241E]">
              Meu Extrato
            </CardTitle>
            <CardDescription className="text-base font-medium text-[#2D241E]/50">
              Acompanhe para onde está indo seu dinheiro.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
              <Select value={typeFilter} onValueChange={(value) => onFilterChange(value as any)}>
                  <SelectTrigger className="w-auto h-12 bg-[#f6f3f1] border-none rounded-2xl px-4 font-bold text-[#2D241E]">
                      <ListFilter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrar" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-[#2D241E]/5 shadow-xl">
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="income">Entradas</SelectItem>
                      <SelectItem value="expense">Saídas</SelectItem>
                      <SelectItem value="transfer">Transferências</SelectItem>
                  </SelectContent>
              </Select>
              <AddTransactionDialog accounts={accounts} goals={goals} categories={categories} ownerId={ownerId} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto -mx-6 px-6">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#2D241E]/5 hover:bg-transparent">
                <TableHead className="py-6 px-4 text-[10px] font-black text-[#2D241E]/40 uppercase tracking-[2px]">Descrição</TableHead>
                <TableHead className="py-6 px-4 text-[10px] font-black text-[#2D241E]/40 uppercase tracking-[2px] hidden md:table-cell">Categoria</TableHead>
                <TableHead className="py-6 px-4 text-[10px] font-black text-[#2D241E]/40 uppercase tracking-[2px] hidden lg:table-cell">Frequência</TableHead>
                <TableHead className="py-6 px-4 text-[10px] font-black text-[#2D241E]/40 uppercase tracking-[2px] hidden sm:table-cell">Data</TableHead>
                <TableHead className="py-6 px-4 text-right text-[10px] font-black text-[#2D241E]/40 uppercase tracking-[2px]">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.slice(0, 5).map((tx, index) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="group border-b border-[#2D241E]/5 hover:bg-[#f6f3f1]/50 transition-colors"
                >
                  <TableCell className="py-6 px-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-[#2D241E]/5 text-xl group-hover:scale-110 transition-transform">
                        {tx.type === 'income' ? '💰' : '💸'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-[#2D241E] text-base leading-tight">{tx.description}</span>
                        <span className="text-[10px] font-bold text-[#201C1C]/40 uppercase tracking-widest block sm:hidden">{formatDate(tx.date)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-6 px-4 hidden md:table-cell">
                    <Badge variant="outline" className="border-[#2D241E]/10 bg-white text-[#2D241E]/60 rounded-xl px-3 py-1 font-black text-[10px] uppercase tracking-widest whitespace-nowrap">
                      {typeof tx.category === 'object' ? (tx.category as any)?.name : tx.category || (tx.type === 'income' ? 'Ganho' : 'Gasto')}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-6 px-4 hidden lg:table-cell">
                    {tx.isRecurring ? (
                      <Badge className="bg-blue-50 text-blue-700 border border-blue-100 rounded-xl px-3 py-1 font-black text-[10px] uppercase tracking-widest shadow-none">Fixo</Badge>
                    ) : tx.isInstallment ? (
                      <Badge className="bg-purple-50 text-purple-700 border border-purple-100 rounded-xl px-3 py-1 font-black text-[10px] uppercase tracking-widest shadow-none">Parcelas</Badge>
                    ) : (
                      <span className="text-sm font-bold text-[#2D241E]/30 uppercase italic tracking-widest">Única</span>
                    )}
                  </TableCell>
                  <TableCell className="py-6 px-4 text-sm font-black text-[#2D241E]/70 hidden sm:table-cell">
                    {formatDate(tx.date)}
                  </TableCell>
                  <TableCell className="py-6 px-4 text-right">
                    <p className={cn(
                      "text-xl font-black tracking-tighter",
                      tx.type === 'income' ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {!isLoaded || isPrivate ? <PrivacyBlur /> : <AnimatedCounter value={tx.amount} formatter={(v) => `${tx.type === 'income' ? '+' : '-'} ${formatCurrency(v)}`} />}
                    </p>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredTransactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center space-y-8 bg-[#fdfcf7] rounded-[48px] border-2 border-dashed border-[#2D241E]/5 mt-6 group">
            <div className="relative">
              <div className="h-24 w-24 rounded-[32px] bg-white flex items-center justify-center shadow-sm border border-[#2D241E]/5 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  <Filter className="h-10 w-10 text-[#2D241E]/20" />
              </div>
              <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-[#ff6b7b] flex items-center justify-center text-white shadow-lg animate-bounce">
                <PlusCircle className="h-6 w-6" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-headline text-3xl font-bold text-[#2D241E]">Silêncio por aqui...</h3>
              <p className="text-lg font-medium text-[#2D241E]/50 max-w-[320px] mx-auto">
                Seu extrato ainda está vazio. Que tal registrar sua primeira movimentação agora?
              </p>
            </div>
            <div className="pt-4">
               <AddTransactionDialog accounts={accounts} goals={goals} categories={categories} ownerId={ownerId} />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-4 border-t border-[#2D241E]/5 pt-8">
        <Button variant="outline" asChild className="w-full justify-center rounded-[20px] h-14 font-black border-2 border-[#2D241E]/10 text-[#2D241E] hover:bg-[#2D241E] hover:text-white hover:border-[#2D241E] active:scale-95 transition-all text-base uppercase tracking-widest group">
          <Link href="/transactions">
            Ver histórico completo
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
