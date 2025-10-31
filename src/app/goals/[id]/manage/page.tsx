import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { goals, user, partner } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { InviteParticipantDialog } from '@/components/goals/invite-participant-dialog';
import { DeleteGoalDialog } from '@/components/goals/delete-goal-dialog';

export default function ManageGoalPage({ params }: { params: { id: string } }) {
  const goal = goals.find((g) => g.id === params.id);

  if (!goal) {
    notFound();
  }

  const participants = [user, partner];

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href={`/goals/${goal.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a Caixinha
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Gerenciar Caixinha: {goal.name}
            </CardTitle>
            <CardDescription>
              Adicione, remova ou gerencie os participantes desta caixinha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
                 <h3 className="font-semibold">Participantes</h3>
                <InviteParticipantDialog goalName={goal.name} />
            </div>
            <div className="space-y-4">
              {participants.map((p, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={p.avatarUrl} alt={p.name} />
                      <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      {index === 0 && <p className="text-xs text-muted-foreground">Proprietário(a)</p>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" disabled={index===0}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remover</span>
                  </Button>
                </div>
              ))}
            </div>

            <Separator className="my-8" />
            
            <div>
                 <h3 className="font-semibold text-destructive">Zona de Perigo</h3>
                 <p className="text-sm text-muted-foreground mt-1 mb-4">Ações nesta seção são permanentes e não podem ser desfeitas.</p>
                 <DeleteGoalDialog goalId={goal.id} goalName={goal.name} />
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
