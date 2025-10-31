import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlusCircle } from 'lucide-react';
import type { Goal } from '@/lib/definitions';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { user, partner } from '@/lib/data';

type GoalBucketsProps = {
  goals: Goal[];
};

export default function GoalBuckets({ goals }: GoalBucketsProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Caixinhas de Sonhos</CardTitle>
        <CardDescription>Onde os planos de vocês ganham vida.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {goals.slice(0, 3).map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <Link href={`/goals/${goal.id}`} key={goal.id} className="group flex items-center gap-4 rounded-lg p-3 -m-3 transition-colors hover:bg-muted/50">
              <div className="text-4xl transition-transform group-hover:scale-110">{goal.emoji}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{goal.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </p>
                  </div>
                   <p className="text-sm font-bold text-primary">{Math.round(progress)}%</p>
                </div>
                <Progress value={progress} className="h-3 mt-2" />
                <div className="flex items-center gap-1 mt-2">
                    <Avatar className="h-6 w-6 border-2" style={{borderColor: 'hsl(var(--chart-1))'}}>
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {goal.visibility === 'shared' && (
                      <Avatar className="h-6 w-6 border-2 -ml-3" style={{borderColor: 'hsl(var(--chart-2))'}}>
                          <AvatarImage src={partner.avatarUrl} alt={partner.name} />
                          <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                </div>
              </div>
            </Link>
          );
        })}
         {goals.length === 0 && (
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
