"use client";

import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { goals, transactions, user, partner } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GoalTransactionDialog } from '@/components/goals/goal-transaction-dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from '@/components/ui/animated-counter';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('pt-BR', {timeZone: 'UTC', day: '2-digit', month: 'short'});
}

export default function GoalDetailPage({ params }: { params: { id: string } }) {
  const goal = goals.find((g) => g.id === params.id);

  if (!goal) {
    notFound();
  }
  
  const allParticipants = [user, partner, ...(goal.participants || [])];

  const goalActivity = transactions.filter(t => t.type === 'transfer' && (t.sourceAccountId === goal.id || t.destinationAccountId === goal.id)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const progress = (goal.currentAmount / goal.targetAmount) * 100;

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
            <Button asChild variant="ghost">
            <Link href="/">
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
            <div className="flex items-center gap-4">
                <span className="text-5xl">{goal.emoji}</span>
                <div className="flex-1">
                    <CardTitle className="font-headline text-3xl">{goal.name}</CardTitle>
                    <CardDescription>
                        <AnimatedCounter value={goal.currentAmount} formatter={formatCurrency} /> de {formatCurrency(goal.targetAmount)}
                    </CardDescription>
                </div>
            </div>
            <Progress value={progress} className="mt-4 h-4" />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span className='flex items-center gap-1'><AnimatedCounter value={progress} formatter={(v) => Math.round(v).toString()} />% completo</span>
                <span>Faltam {formatCurrency(goal.targetAmount - goal.currentAmount)}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 my-4">
                <GoalTransactionDialog type="deposit" goalId={goal.id} />
                <GoalTransactionDialog type="withdrawal" goalId={goal.id} />
            </div>

            <h3 className="font-headline text-xl font-semibold mt-8 mb-4">Histórico de Atividades</h3>
            <div className="space-y-4">
                {goalActivity.map(activity => {
                    const isDeposit = activity.destinationAccountId === goal.id;
                    const actor = allParticipants.find(p => p.id === activity.actor) || user;
                    return (
                        <div key={activity.id} className="flex items-center gap-4">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={actor.avatarUrl} alt={actor.name} />
                                <AvatarFallback>{actor.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="text-sm">
                                    <span className="font-semibold">{actor.name}</span>
                                    {isDeposit ? ' guardou ' : ' retirou '}
                                    <span className={cn('font-bold', isDeposit ? 'text-green-600' : 'text-red-600')}>
                                        {formatCurrency(activity.amount)}
                                    </span>
                                </p>
                                <p className='text-xs text-muted-foreground'>{activity.description}</p>
                            </div>
                            <time className="text-sm text-muted-foreground">{formatDate(activity.date)}</time>
                        </div>
                    )
                })}
                 {goalActivity.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
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
