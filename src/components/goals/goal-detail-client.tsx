
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, MoreHorizontal, Users, Lock, ArrowDown, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GoalTransactionDialog } from '@/components/goals/goal-transaction-dialog';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { StandardBackButton } from '@/components/ui/standard-back-button';
// Importações consolidadas de definições globais
import { EditTransactionDialog } from '@/components/transactions/edit-transaction-dialog';
import { DeleteTransactionDialog } from '@/components/transactions/delete-transaction-dialog';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('pt-BR', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
  });
}

import type { Account, Vault, Goal, Transaction } from '@/lib/definitions';

// Removendo tipos locais redundantes para usar os globais do definitions.ts

type GoalDetailClientProps = {
  goal: Goal;
  transactions: Transaction[];
  accounts: Account[];
  vaults: Vault[];
  userId: string;
};

export function GoalDetailClient({ goal, transactions, accounts, vaults, userId }: GoalDetailClientProps) {
  const [currentAmount, setCurrentAmount] = useState(goal.currentAmount);

  const hasAccounts = accounts.length > 0;
  const hasBalance = currentAmount > 0;

  const transactionTotal = transactions.reduce((acc, t) => {
    return t.sourceAccountId ? acc + t.amount : acc - t.amount;
  }, 0);

  const initialAmount = goal.currentAmount - transactionTotal;

  const virtualInitialTransaction = {
    id: 'initial-balance',
    date: new Date(goal.createdAt).toISOString(),
    description: 'Valor inicial da caixinha',
    amount: initialAmount,
    type: 'income' as const,
    actor: { id: 'system', name: 'Sistema', avatarUrl: '' },
    sourceAccountId: 'system-initial',
    destinationAccountId: null,
    ownerId: goal.ownerId,
    ownerType: 'vault' as const,
    category: { name: 'Saldo Inicial' } as any,
  };

  const allActivities = [
    ...(initialAmount > 0.01 ? [virtualInitialTransaction] : []),
    ...transactions,
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const progress = (currentAmount / goal.targetAmount) * 100;

  // Usar vaultId/userId como fonte da verdade para determinar o tipo da caixinha
  const isVaultGoal = !!goal.vaultId;
  const ownerName = isVaultGoal
    ? vaults.find(v => v.id === goal.vaultId)?.name || 'Cofre Desconhecido'
    : 'Caixinha Pessoal';

  const handleTransactionComplete = () => {
    window.location.reload();
  };

  const transactionButtons = (
    <div className="my-4 flex flex-col sm:flex-row gap-2">
      <GoalTransactionDialog type="deposit" goalId={goal.id} accounts={accounts} onComplete={handleTransactionComplete} />
      <GoalTransactionDialog 
        type="withdrawal" 
        goalId={goal.id} 
        accounts={accounts} 
        onComplete={handleTransactionComplete} 
        disabled={!hasBalance}
      />
    </div>
  );

  return (
    <div className="relative flex flex-col items-center px-4 md:px-8 pt-24 pb-32">
      {/* Subtle overlay to darken background slightly for better readability */}
      <div className="absolute inset-0 bg-[#2D241E]/[0.02] pointer-events-none z-0" />
      
      <div className="relative z-10 w-full max-w-4xl">
        {/* Navigation & Actions Header */}
        <div className="mb-12 flex items-center justify-between">
          <StandardBackButton href="/goals" label="Voltar" className="mb-0" />
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="icon" className="h-10 w-10 rounded-xl border-[#2D241E]/10 text-[#2D241E]/60 hover:text-[#ff6b7b] hover:border-[#ff6b7b]/20 hover:bg-white transition-all shadow-sm">
                <Link href={`/goals/${goal.id}/manage`}>
                <Settings className="h-5 w-5" />
                <span className="sr-only">Gerenciar</span>
                </Link>
            </Button>
          </div>
        </div>

        {/* HERO SECTION */}
        <div className="relative mb-16">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-14">
                {/* Large Emoji Box */}
                <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-tr from-[#ff6b7b]/30 to-[#fa8292]/15 rounded-[45px] blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
                    <div className="relative w-36 h-36 md:w-52 md:h-52 bg-white rounded-[45px] shadow-[0_25px_60px_rgba(45,36,30,0.15)] flex items-center justify-center text-7xl md:text-9xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-2 border border-white">
                        {goal.emoji}
                    </div>
                </div>

                {/* Progress & Info */}
                <div className="flex-1 text-center md:text-left space-y-6 w-full">
                    <div className="space-y-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
                            <h1 className="font-headline text-4xl md:text-6xl font-black tracking-tight text-[#2D241E]">
                                {goal.name}
                            </h1>
                            <div className="inline-flex items-center self-center md:self-auto gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-white/90 shadow-sm backdrop-blur-md">
                                {goal.visibility === 'shared' ? <Users className="h-4 w-4 text-[#ff6b7b]" /> : <Lock className="h-4 w-4 text-[#2D241E]/60" />}
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/70">
                                    {goal.visibility === 'shared' ? 'Compartilhada' : 'Privada'}
                                </span>
                            </div>
                        </div>
                        <p className="text-[#ff6b7b] font-black text-lg md:text-xl uppercase tracking-[0.2em]">
                            {ownerName}
                        </p>
                    </div>

                    <div className="space-y-8 max-w-2xl">
                        <div className="space-y-3">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-4xl md:text-5xl font-black text-[#2D241E] tracking-tighter">
                                    <AnimatedCounter value={progress} formatter={(v) => Math.round(v).toString()} />%
                                </span>
                                <div className="text-right">
                                    <p className="text-[11px] font-black text-[#2D241E]/60 uppercase tracking-[2px] mb-1">Progresso Atual</p>
                                    <p className="text-lg font-bold text-[#2D241E]/80 truncate">
                                        <AnimatedCounter value={currentAmount} formatter={formatCurrency} /> <span className="text-[#2D241E]/40 font-medium mx-1">/</span> {formatCurrency(goal.targetAmount)}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Premium Progress Bar */}
                            <div className="relative h-7 w-full bg-[#2D241E]/10 rounded-full overflow-hidden shadow-inner p-1">
                                <div 
                                    className="absolute inset-y-1 left-1 bg-gradient-to-r from-[#ff6b7b] to-[#fa8292] rounded-full transition-all duration-[2000ms] ease-out flex items-center justify-end px-3 shadow-sm"
                                    style={{ width: `calc(${Math.min(progress, 100)}% - 8px)` }}
                                >
                                    {progress > 15 && <div className="h-2 w-2 bg-white/50 rounded-full shadow-sm" />}
                                </div>
                                {progress >= 100 && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                                )}
                            </div>
                            
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[2px] text-[#2D241E]/50 pt-1">
                                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500/50" /> Início: {formatDate(goal.createdAt)}</span>
                                <span className="flex items-center gap-1.5">Faltam: <span className="text-[#ff6b7b]">{formatCurrency(Math.max(0, goal.targetAmount - currentAmount))}</span> <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b7b]/50" /></span>
                            </div>
                        </div>

                        {/* Quick Actions Buttons */}
                        <div className="flex flex-col sm:flex-row gap-5 pt-4">
                            <div className="flex-1">
                                <GoalTransactionDialog 
                                    type="deposit" 
                                    goalId={goal.id} 
                                    accounts={accounts} 
                                    onComplete={handleTransactionComplete}
                                    className="scale-105 sm:scale-100"
                                />
                            </div>
                            <div className="flex-1">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="w-full">
                                                <GoalTransactionDialog 
                                                    type="withdrawal" 
                                                    goalId={goal.id} 
                                                    accounts={accounts} 
                                                    onComplete={handleTransactionComplete} 
                                                    disabled={!hasBalance}
                                                    className="scale-105 sm:scale-100"
                                                />
                                            </div>
                                        </TooltipTrigger>
                                        {!hasBalance && (
                                            <TooltipContent className="bg-[#2D241E] text-white border-0 rounded-xl px-4 py-2">
                                                <p className="font-bold text-xs capitalize tracking-wider">Saldo insuficiente para retirada</p>
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* CONTENT TABS / LISTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column: Details & Participants */}
            <div className="lg:col-span-1 space-y-10">
                <div className="bg-white/50 backdrop-blur-md rounded-[35px] p-8 border border-white/80 shadow-[0_15px_40px_rgba(45,36,30,0.08)]">
                    <h3 className="font-headline text-xl font-bold text-[#2D241E] mb-8 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#ff6b7b]/10 text-[#ff6b7b]">
                            <Users className="h-5 w-5" />
                        </div>
                        Participantes
                    </h3>
                    <div className="space-y-5">
                        {goal.participants?.map((p) => (
                            <div key={p.id} className="flex items-center gap-4 bg-white/60 p-4 rounded-[22px] border border-white/40 shadow-sm hover:shadow-md transition-all duration-300">
                                <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                                    <AvatarImage src={p.user.avatarUrl} alt={p.user.name} />
                                    <AvatarFallback className="bg-[#ff6b7b]/10 text-[#ff6b7b] font-black">{p.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-[#2D241E] truncate text-sm">{p.user.name}</p>
                                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#2D241E]/50 italic">{p.role === 'owner' ? 'Dono' : 'Colaborador'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: History */}
            <div className="lg:col-span-2">
                <div className="bg-white/50 backdrop-blur-md rounded-[35px] p-8 border border-white/80 shadow-[0_15px_40px_rgba(45,36,30,0.08)]">
                    <h3 className="font-headline text-xl font-bold text-[#2D241E] mb-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-[#2D241E]/5 text-[#2D241E]/80">
                                <ArrowDown className="h-5 w-5" />
                            </div>
                            <span>Linha do Tempo</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/50 bg-white/60 px-3 py-1.5 rounded-full border border-white/80">{allActivities.length} registros</span>
                    </h3>
                    
                    <div className="space-y-10 relative before:absolute before:inset-y-0 before:left-6 before:w-[2px] before:bg-gradient-to-b before:from-[#2D241E]/10 before:via-[#2D241E]/5 before:to-transparent">
                        {allActivities.map((activity, idx) => {
                            const isDeposit = activity.type === 'income' || (activity.type === 'transfer' && !!activity.sourceAccountId);
                            const actor = activity.actor || { id: 'unknown', name: 'Usuário', avatarUrl: '' };
                            
                            return (
                                <div key={activity.id} className="relative flex items-start gap-8 group">
                                    {/* Timeline dot/avatar */}
                                    <div className="relative z-10 pt-1">
                                        <Avatar className="h-12 w-12 border-4 border-white shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                                            <AvatarImage src={actor.avatarUrl} alt={actor.name} />
                                            <AvatarFallback className="bg-[#2D241E]/5 text-[#2D241E]/60 text-xs font-black">{actor.name.substring(0,2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        {idx === 0 && <div className="absolute -inset-1.5 bg-[#ff6b7b]/20 rounded-full animate-pulse opacity-40" />}
                                    </div>

                                    {/* Content Card */}
                                    <div className="flex-1 bg-white/60 hover:bg-white/90 p-6 rounded-[28px] border border-white/40 hover:border-[#ff6b7b]/20 hover:shadow-2xl transition-all duration-500">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="text-base font-bold text-[#2D241E]">
                                                    {actor.name} 
                                                    <span className="text-[#2D241E]/60 font-medium ml-1.5">
                                                        {activity.id === 'initial-balance' ? 'iniciou a caixinha' : (isDeposit ? 'guardou' : 'retirou')}
                                                    </span>
                                                </p>
                                                <time className="text-[10px] font-black uppercase tracking-[0.15em] text-[#2D241E]/50 mt-1 block">
                                                    {formatDate(activity.date)}
                                                </time>
                                            </div>
                                            <div className="text-right">
                                                <p className={cn(
                                                    "text-xl font-black tracking-tight",
                                                    isDeposit ? "text-green-600" : "text-red-500"
                                                )}>
                                                    {isDeposit ? '+' : '-'}{formatCurrency(activity.amount)}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {activity.description && (
                                            <div className="relative mt-3">
                                                <div className="absolute inset-y-0 left-0 w-1 bg-[#ff6b7b]/10 rounded-full" />
                                                <p className="text-xs text-[#2D241E]/70 pl-4 py-1 italic font-medium leading-relaxed">
                                                    "{activity.description}"
                                                </p>
                                            </div>
                                        )}

                                        {activity.id !== 'initial-balance' && (
                                            <div className="mt-4 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-[#ff6b7b]/10 hover:text-[#ff6b7b] transition-colors">
                                                            <MoreHorizontal className="h-5 w-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-2xl border-[#2D241E]/5 shadow-2xl p-1 min-w-[140px]">
                                                        {/* @ts-ignore */}
                                                        <EditTransactionDialog 
                                                            transaction={activity} 
                                                            accounts={accounts} 
                                                            goals={[goal]} 
                                                            categories={[]} 
                                                            trigger={
                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Editar
                                                                </DropdownMenuItem>
                                                            }
                                                        />
                                                        <DeleteTransactionDialog 
                                                            transactionId={activity.id} 
                                                            trigger={
                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Excluir
                                                                </DropdownMenuItem>
                                                            }
                                                        />
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        
                        {allActivities.length === 0 && (
                            <div className="text-center py-20 bg-white/30 rounded-[40px] border-2 border-dashed border-[#2D241E]/10">
                                <p className="text-[#2D241E]/40 font-black italic tracking-widest uppercase text-xs">Nenhuma atividade registrada ainda</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
