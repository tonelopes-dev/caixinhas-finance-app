'use client';

import Link from 'next/link';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { goals } from '@/lib/data';

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
import { user, partner } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Lock, Users } from 'lucide-react';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function GoalsPage() {
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
              Acompanhe o progresso de todos os seus sonhos, grandes e pequenos.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            {goals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              return (
                <Link href={`/goals/${goal.id}`} key={goal.id}>
                  <Card className="flex h-full flex-col transition-all hover:shadow-md">
                    <CardHeader className="flex-row items-start gap-4">
                      <span className="text-5xl">{goal.emoji}</span>
                      <div className="flex-1">
                        <CardTitle>{goal.name}</CardTitle>
                        <CardDescription>
                          {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <Progress value={progress} className="h-3" />
                       <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                            <div className="flex items-center gap-2">
                                {goal.visibility === 'shared' ? <Users className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                <span>{goal.visibility === 'shared' ? 'Compartilhada' : 'Privada'}</span>
                            </div>
                            <p className="font-bold text-primary">{Math.round(progress)}%</p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex items-center gap-2 pt-4">
                      <div className="flex -space-x-2 overflow-hidden">
                        <Avatar className="inline-block h-6 w-6 rounded-full border-2 border-card">
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {goal.visibility === 'shared' && (
                          <Avatar className="inline-block h-6 w-6 rounded-full border-2 border-card">
                             <AvatarImage src={partner.avatarUrl} />
                             <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                      <span className='text-xs text-muted-foreground'>
                        {goal.visibility === 'shared' ? 'Você e Parceiro(a)' : 'Apenas você'}
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
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
