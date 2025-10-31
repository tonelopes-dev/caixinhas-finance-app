import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Settings,
  ArrowDown,
  ArrowUp,
  Plus,
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
import { goals } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const goalActivity = [
    {
        id: '1',
        type: 'deposit',
        amount: 200,
        user: { name: 'Você', avatarUrl: 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHx3b21hbiUyMHBvcnRyYWl0fGVufDB8fHx8MTc2MTgwMzQ2MHww&ixlib=rb-4.1.0&q=80&w=1080' },
        date: '2024-07-26',
    },
    {
        id: '2',
        type: 'deposit',
        amount: 150,
        user: { name: 'Parceiro(a)', avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxtYW4lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NjE3NTYzNjF8MA&ixlib=rb-4.1.0&q=80&w=1080' },
        date: '2024-07-25',
    },
    {
        id: '3',
        type: 'withdrawal',
        amount: 50,
        user: { name: 'Você', avatarUrl: 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHx3b21hbiUyMHBvcnRyYWl0fGVufDB8fHx8MTc2MTgwMzQ2MHww&ixlib=rb-4.1.0&q=80&w=1080' },
        date: '2024-07-24',
    }
]

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
                        {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                    </CardDescription>
                </div>
            </div>
            <Progress value={progress} className="mt-4 h-4" />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>{Math.round(progress)}% completo</span>
                <span>Faltam {formatCurrency(goal.targetAmount - goal.currentAmount)}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 my-4">
                <Button className="flex-1">
                    <ArrowDown className="mr-2 h-4 w-4" />
                    Guardar Dinheiro
                </Button>
                 <Button className="flex-1" variant="secondary">
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Retirar Dinheiro
                </Button>
            </div>

            <h3 className="font-headline text-xl font-semibold mt-8 mb-4">Histórico de Atividades</h3>
            <div className="space-y-4">
                {goalActivity.map(activity => (
                    <div key={activity.id} className="flex items-center gap-4">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={activity.user.avatarUrl} alt={activity.user.name} />
                            <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="text-sm">
                                <span className="font-semibold">{activity.user.name}</span>
                                {activity.type === 'deposit' ? ' guardou ' : ' retirou '}
                                <span className={`font-bold ${activity.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(activity.amount)}
                                </span>
                            </p>
                        </div>
                        <time className="text-sm text-muted-foreground">{formatDate(activity.date)}</time>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
