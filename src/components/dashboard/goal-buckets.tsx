

'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlusCircle, Users, Lock } from 'lucide-react';
import type { Goal } from '@/lib/definitions';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { user, partner } from '@/lib/data';
import { AnimatedCounter } from '../ui/animated-counter';

type GoalBucketsProps = {
  goals: Goal[];
};

export default function GoalBuckets({ goals }: GoalBucketsProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const incompleteGoals = goals.filter(g => g.currentAmount < g.targetAmount);

  // Sort all incomplete goals by progress percentage in descending order
  incompleteGoals.sort((a, b) => {
    const progressA = a.currentAmount / a.targetAmount;
    const progressB = b.currentAmount / b.targetAmount;
    return progressB - progressA;
  });

  // Separate featured from non-featured, maintaining the sort order
  const featuredGoals = incompleteGoals.filter(g => g.isFeatured);
  const otherGoals = incompleteGoals.filter(g => !g.isFeatured);

  // Show featured goals first, then other goals, up to a max of 3
  const goalsToShow = [...featuredGoals, ...otherGoals].slice(0, 3);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Caixinhas de Sonhos</CardTitle>
        <CardDescription>Onde os planos de vocês ganham vida.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {goalsToShow.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const participants = goal.participants ?? (goal.visibility === 'shared' ? [user, partner] : [user]);
          return (
            <Link href={`/goals/${goal.id}`} key={goal.id} className="group flex items-center gap-4 rounded-lg p-3 -m-3 transition-colors hover:bg-muted/50">
              <div className="text-4xl transition-transform group-hover:scale-110">{goal.emoji}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{goal.name}</p>
                    <p className="text-sm text-muted-foreground">
                      <AnimatedCounter value={goal.currentAmount} formatter={formatCurrency} /> / {formatCurrency(goal.targetAmount)}
                    </p>
                  </div>
                   <p className="text-sm font-bold text-primary flex items-center gap-1"><AnimatedCounter value={progress} formatter={(v) => Math.round(v).toString()} />%</p>
                </div>
                <Progress value={progress} className="h-3 mt-2" />
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                        <div className="flex -space-x-2 overflow-hidden">
                            {participants.slice(0, 4).map((p, index) => (
                                 <Avatar key={p.id ?? index} className="inline-block h-6 w-6 rounded-full border-2 border-card">
                                    <AvatarImage src={p.avatarUrl} alt={p.name} />
                                    <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            ))}
                            {participants.length > 4 && (
                                <Avatar className="inline-block h-6 w-6 rounded-full border-2 border-card">
                                    <AvatarFallback>+{participants.length - 4}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {goal.visibility === 'shared' ? <Users className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                        <span>{goal.visibility === 'shared' ? 'Compartilhada' : 'Privada'}</span>
                    </div>
                </div>
              </div>
            </Link>
          );
        })}
         {goalsToShow.length === 0 && (
          <p className="text-center text-muted-foreground py-4">Nenhuma caixinha criada ainda. Que tal começar um novo sonho?</p>
        )}
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2 border-t pt-6 md:flex-row">
        <Button variant="ghost" asChild className="flex-1">
            <Link href="/goals">
                Ver todas as caixinhas
                <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
        <Button variant="outline" className="w-full flex-1" asChild>
          <Link href="/goals/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Nova Caixinha
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
