'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GoalTransactionDialog } from '@/components/goals/goal-transaction-dialog';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from '@/components/ui/animated-counter';

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
};

type GoalDetailClientProps = {
  goal: Goal;
  transactions: Transaction[];
  userId: string;
};

export function GoalDetailClient({ goal, transactions, userId }: GoalDetailClientProps) {
  const [currentAmount, setCurrentAmount] = useState(goal.currentAmount);

  // Filtrar transações relacionadas à meta
  const goalActivity = transactions
    .filter(
      (t) =>
        t.type === 'transfer' &&
        (t.sourceAccountId === goal.id || t.destinationAccountId === goal.id)
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const progress = (currentAmount / goal.targetAmount) * 100;

  const handleTransactionComplete = () => {
    // Recarregar a página para pegar novos dados
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <Button asChild variant="ghost">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o Painel
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
                <CardTitle className="font-headline text-2xl md:text-3xl">
                  {goal.name}
                </CardTitle>
                <CardDescription className="mt-1">
                  <AnimatedCounter
                    value={currentAmount}
                    formatter={formatCurrency}
                  />{' '}
                  de {formatCurrency(goal.targetAmount)}
                </CardDescription>
              </div>
            </div>
            <Progress value={progress} className="mt-4 h-4" />
            <div className="mt-2 flex justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <AnimatedCounter
                  value={progress}
                  formatter={(v) => Math.round(v).toString()}
                />
                % completo
              </span>
              <span>
                Faltam {formatCurrency(goal.targetAmount - currentAmount)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="my-4 flex flex-col sm:flex-row gap-2">
              <GoalTransactionDialog 
                type="deposit" 
                goalId={goal.id}
                onComplete={handleTransactionComplete}
              />
              <GoalTransactionDialog 
                type="withdrawal" 
                goalId={goal.id}
                onComplete={handleTransactionComplete}
              />
            </div>

            <h3 className="font-headline mt-8 mb-4 text-xl font-semibold">
              Histórico de Atividades
            </h3>
            <div className="space-y-4">
              {goalActivity.map((activity) => {
                const isDeposit = activity.destinationAccountId === goal.id;
                const actor = goal.participants.find((p) => p.id === activity.actorId) || 
                              { name: 'Usuário', avatarUrl: '' };
                
                return (
                  <div key={activity.id} className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={actor.avatarUrl} alt={actor.name} />
                      <AvatarFallback>{actor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className='flex justify-between items-baseline'>
                        <p className="text-sm sm:text-base">
                          <span className="font-semibold">{actor.name}</span>
                          {isDeposit ? ' guardou ' : ' retirou '}
                          <span
                            className={cn(
                              'font-bold',
                              isDeposit ? 'text-green-600' : 'text-red-600'
                            )}
                          >
                            {formatCurrency(activity.amount)}
                          </span>
                        </p>
                        <time className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(activity.date)}
                        </time>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                );
              })}
              {goalActivity.length === 0 && (
                <p className="py-4 text-center text-muted-foreground">
                  Nenhuma atividade registrada para esta caixinha ainda.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
