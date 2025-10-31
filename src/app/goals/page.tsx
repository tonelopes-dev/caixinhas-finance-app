'use client';

import Link from 'next/link';
import { ArrowLeft, PlusCircle, Star } from 'lucide-react';
import { goals as allGoals, user, partner } from '@/lib/data';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Lock, Users } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function GoalsPage() {
    // In a real app, this state would be managed via server actions and a database.
    const [goals, setGoals] = useState(allGoals);

    const toggleFeatured = (goalId: string) => {
        setGoals(goals.map(g => g.id === goalId ? { ...g, isFeatured: !g.isFeatured } : g));
    }


  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Painel
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Todas as Caixinhas
            </CardTitle>
            <CardDescription>
              Acompanhe e gerencie o progresso de todos os seus sonhos, grandes e pequenos.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            {goals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const participants = goal.participants ?? (goal.visibility === 'shared' ? [user, partner] : [user]);
              return (
                  <Card key={goal.id} className="flex h-full flex-col transition-all hover:shadow-md">
                    <CardHeader className="flex-row items-start gap-4">
                      <Link href={`/goals/${goal.id}`} className='flex-1 flex items-start gap-4'>
                        <span className="text-5xl">{goal.emoji}</span>
                        <div className="flex-1">
                          <CardTitle>{goal.name}</CardTitle>
                          <CardDescription>
                            {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                          </CardDescription>
                        </div>
                      </Link>
                      <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground transition-colors hover:text-yellow-500"
                                    onClick={() => toggleFeatured(goal.id)}
                                    >
                                    <Star className={cn("h-5 w-5", goal.isFeatured && "fill-yellow-400 text-yellow-500")} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{goal.isFeatured ? "Remover dos destaques" : "Destacar no painel"}</p>
                            </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <Link href={`/goals/${goal.id}`} className='block'>
                          <Progress value={progress} className="h-3" />
                          <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                                <div className="flex items-center gap-2">
                                    {goal.visibility === 'shared' ? <Users className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                    <span>{goal.visibility === 'shared' ? 'Compartilhada' : 'Privada'}</span>
                                </div>
                                <p className="font-bold text-primary flex items-center gap-1"><AnimatedCounter value={progress} formatter={(v) => Math.round(v).toString()} />%</p>
                            </div>
                      </Link>
                    </CardContent>
                    <CardFooter className="flex items-center gap-2 pt-4">
                     <Link href={`/goals/${goal.id}`} className='flex-1 flex items-center gap-2'>
                      <div className="flex -space-x-2 overflow-hidden">
                        {participants.slice(0, 5).map((p, index) => (
                           <Avatar key={p.id ?? index} className="inline-block h-6 w-6 rounded-full border-2 border-card">
                             <AvatarImage src={p.avatarUrl} alt={p.name}/>
                             <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ))}
                        {participants.length > 5 && (
                            <Avatar className="inline-block h-6 w-6 rounded-full border-2 border-card">
                               <AvatarFallback>+{participants.length - 5}</AvatarFallback>
                            </Avatar>
                        )}
                      </div>
                      <span className='text-xs text-muted-foreground'>
                        {participants.length > 1 ? `${participants.length} participantes` : 'Apenas você'}
                      </span>
                      </Link>
                    </CardFooter>
                  </Card>
              );
            })}
          </CardContent>
          <CardFooter className='border-t pt-6'>
            <Button variant="outline" className="w-full" asChild>
                <Link href="/goals/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Criar Nova Caixinha
                </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
