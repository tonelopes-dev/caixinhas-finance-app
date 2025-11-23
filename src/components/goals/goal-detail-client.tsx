
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, MoreHorizontal } from 'lucide-react';
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
import { GoalTransactionDialog } from '@/components/goals/goal-transaction-dialog';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import type { Account, Vault } from '@/lib/definitions';
import { EditTransactionDialog } from '@/components/transactions/edit-transaction-dialog';
import { DeleteTransactionDialog } from '@/components/transactions/delete-transaction-dialog';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
  });
}

type Goal = {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  currentAmount: number;
  visibility: 'private' | 'shared';
  isFeatured: boolean;
  ownerId: string;
  ownerType: 'user' | 'vault';
  participants: {
    id: string;
    name: string;
    avatarUrl: string;
    role: string;
  }[];
};

type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  actorId: string;
  sourceAccountId: string | null;
  destinationAccountId: string | null;
  ownerId: string;
};

type GoalDetailClientProps = {
  goal: Goal;
  transactions: Transaction[];
  accounts: Account[];
  vaults: Vault[]; // Vaults agora são recebidos
  userId: string;
};

export function GoalDetailClient({ goal, transactions, accounts, vaults, userId }: GoalDetailClientProps) {
  const [currentAmount, setCurrentAmount] = useState(goal.currentAmount);

  // Lógica para calcular e inserir o saldo inicial
  const transactionTotal = transactions.reduce((acc, t) => {
    // Um depósito (sourceAccountId existe) aumenta o valor na caixinha
    // Uma retirada (destinationAccountId existe) diminui o valor
    return t.sourceAccountId ? acc + t.amount : acc - t.amount;
  }, 0);

  const initialAmount = goal.currentAmount - transactionTotal;

  const virtualInitialTransaction = {
    id: 'initial-balance',
    date: new Date(goal.createdAt).toISOString(), // Usando a data de criação da caixinha
    description: 'Valor inicial da caixinha',
    amount: initialAmount,
    type: 'income' as const,
    actorId: 'system',
    sourceAccountId: 'system-initial',
    destinationAccountId: null,
    ownerId: goal.ownerId,
    category: 'Saldo Inicial',
  };

  // Adiciona a transação inicial apenas se ela for maior que zero
  const allActivities = [
    ...(initialAmount > 0.01 ? [virtualInitialTransaction] : []),
    ...transactions,
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const progress = (currentAmount / goal.targetAmount) * 100;

  const ownerName = goal.ownerType === 'vault' 
    ? vaults.find(v => v.id === goal.ownerId)?.name || 'Cofre Desconhecido'
    : 'Caixinha Pessoal';

  const handleTransactionComplete = () => {
    window.location.reload();
  };

  const getActor = (actorId: string) => {
    if (actorId === 'system') return { id: 'system', name: 'Sistema', avatarUrl: '' };
    return goal.participants.find((p) => p.id === actorId) || 
           { id: 'unknown', name: 'Usuário', avatarUrl: '' };
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <Button asChild variant="ghost">
            <Link href="/goals">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Caixinhas
            </Link>
          </Button>
          <Button asChild variant="outline" size="icon">
            <Link href={`/goals/${goal.id}/manage`}>
              <Settings className="h-4 w-4" />
              <span className="sr-only">Gerenciar</span>
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-4">
              <span className="text-5xl sm:text-6xl">{goal.emoji}</span>
              <div className="flex-1">
                <CardTitle className="font-headline text-2xl md:text-3xl">{goal.name}</CardTitle>
                {/* Contexto adicionado abaixo do título */}
                <p className="text-base font-semibold text-amber-800 dark:text-amber-600">
                  {ownerName}
                </p>
                <CardDescription className="mt-1">
                  <AnimatedCounter value={currentAmount} formatter={formatCurrency} /> de {formatCurrency(goal.targetAmount)}
                </CardDescription>
              </div>
            </div>
            <Progress value={progress} className="mt-4 h-4" />
            <div className="mt-2 flex justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <AnimatedCounter value={progress} formatter={(v) => Math.round(v).toString()} />% completo
              </span>
              <span>Faltam <AnimatedCounter value={Math.max(0, goal.targetAmount - currentAmount)} formatter={formatCurrency} /></span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="my-4 flex flex-col sm:flex-row gap-2">
              <GoalTransactionDialog type="deposit" goalId={goal.id} accounts={accounts} onComplete={handleTransactionComplete} />
              <GoalTransactionDialog type="withdrawal" goalId={goal.id} accounts={accounts} onComplete={handleTransactionComplete} />
            </div>
            <h3 className="font-headline mt-8 mb-4 text-xl font-semibold">Histórico de Atividades</h3>
            <div className="space-y-4">
              {allActivities.map((activity) => {
                const isDeposit = activity.type === 'income' || (activity.type === 'transfer' && !!activity.sourceAccountId);
                const actor = getActor(activity.actorId);
                const descriptionText = activity.id === 'initial-balance' 
                  ? 'Saldo inicial da caixinha' 
                  : <><span className="font-semibold">{actor.name}</span> {isDeposit ? ' guardou ' : ' retirou '}</>;

                return (
                  <div key={activity.id} className="flex items-center gap-4 group">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={actor.avatarUrl} alt={actor.name} />
                      <AvatarFallback>{actor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className='flex justify-between items-baseline'>
                        <p className="text-sm sm:text-base">
                          {descriptionText}
                          {activity.id !== 'initial-balance' && (
                            <span className={cn('font-bold', isDeposit ? 'text-green-600' : 'text-red-600')}>
                              {formatCurrency(activity.amount)}
                            </span>
                          )}
                        </p>
                        <time className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(activity.date)}
                        </time>
                      </div>
                      {activity.id !== 'initial-balance' && <p className="text-xs text-muted-foreground">{activity.description}</p>}
                      {activity.id === 'initial-balance' && <p className="text-xs font-bold text-green-600">{formatCurrency(activity.amount)}</p>}
                    </div>
                    {activity.id !== 'initial-balance' && (
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreHorizontal className="h-4 w-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <EditTransactionDialog transaction={activity as any} accounts={accounts} goals={[goal as any]} categories={[]} />
                              <DeleteTransactionDialog transactionId={activity.id} />
                          </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                );
              })}
              {allActivities.length === 0 && (
                <p className="py-4 text-center text-muted-foreground">Nenhuma atividade registrada para esta caixinha ainda.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
