import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, PlusCircle, Users, XCircle } from 'lucide-react';
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
        {goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <Link href={`/goals/${goal.id}`} key={goal.id} className="group flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-muted/50">
              <div className="text-3xl transition-transform group-hover:scale-110">{goal.emoji}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{goal.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Avatar className="h-5 w-5 border-2 border-background">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-5 w-5 border-2 border-background -ml-2">
                        <AvatarImage src={partner.avatarUrl} alt={partner.name} />
                        <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                     <p className="text-sm font-medium text-muted-foreground">{Math.round(progress)}%</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/goals/${goal.id}/manage`}>
                            <Users className="mr-2 h-4 w-4" />
                            Gerenciar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <XCircle className="mr-2 h-4 w-4" />
                          Sair da caixinha
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <Progress value={progress} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                </p>
              </div>
            </Link>
          );
        })}
         {goals.length === 0 && (
          <p className="text-center text-muted-foreground py-4">Nenhuma caixinha criada ainda. Que tal começar um novo sonho?</p>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/goals/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Nova Caixinha
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
