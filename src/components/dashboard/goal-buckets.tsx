import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { Goal } from '@/lib/definitions';

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
      <CardContent className="grid gap-6">
        {goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <div key={goal.id} className="flex items-center gap-4">
              <div className="text-2xl">{goal.emoji}</div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="font-medium">{goal.name}</p>
                  <p className="text-sm text-muted-foreground">{Math.round(progress)}%</p>
                </div>
                <Progress value={progress} className="h-2 mt-1" />
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                </p>
              </div>
            </div>
          );
        })}
         {goals.length === 0 && (
          <p className="text-center text-muted-foreground py-4">Nenhuma caixinha criada ainda. Que tal começar um novo sonho?</p>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Nova Caixinha
        </Button>
      </CardFooter>
    </Card>
  );
}
