'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Lock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { goals, user, partner } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { InviteParticipantDialog } from '@/components/goals/invite-participant-dialog';
import { DeleteGoalDialog } from '@/components/goals/delete-goal-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { RemoveParticipantDialog } from '@/components/goals/remove-participant-dialog';

export default function ManageGoalPage({ params }: { params: { id: string } }) {
  const goal = goals.find((g) => g.id === params.id);
  const [visibility, setVisibility] = useState(goal?.visibility || 'shared');

  if (!goal) {
    notFound();
  }
  
  const defaultParticipants = [
      { id: 'user', name: user.name, avatarUrl: user.avatarUrl, role: 'owner' as const },
      { id: 'partner', name: partner.name, avatarUrl: partner.avatarUrl, role: 'member' as const },
  ]
  
  const participants = goal.participants ?? (goal.visibility === 'shared' ? defaultParticipants : [defaultParticipants[0]]);


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
              Ajuste as configurações de visibilidade, gerencie participantes e
              outras opções.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="space-y-3 mb-8">
                <Label className="font-semibold">Visibilidade da Caixinha</Label>
                <RadioGroup
                  name="visibility"
                  value={visibility}
                  className="grid grid-cols-2 gap-4"
                  onValueChange={(value) => setVisibility(value as 'shared' | 'private')}
                >
                  <Label
                    className={cn(
                      'flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer',
                      visibility === 'shared' && 'border-primary'
                    )}
                  >
                    <RadioGroupItem
                      value="shared"
                      id="shared"
                      className="sr-only"
                    />
                    <Users className="mb-3 h-6 w-6" />
                    <span className="font-semibold">Compartilhada</span>
                    <span className="text-xs text-center text-muted-foreground mt-1">Visível para todos no cofre.</span>
                  </Label>
                  <Label
                    className={cn(
                      'flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer',
                      visibility === 'private' && 'border-primary'
                    )}
                  >
                    <RadioGroupItem
                      value="private"
                      id="private"
                      className="sr-only"
                    />
                    <Lock className="mb-3 h-6 w-6" />
                     <span className="font-semibold">Privada</span>
                    <span className="text-xs text-center text-muted-foreground mt-1">Apenas para você e convidados.</span>
                  </Label>
                </RadioGroup>
              </div>

              <Separator className="my-8" />

              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Participantes</h3>
                <InviteParticipantDialog goalName={goal.name} />
              </div>
              <div className="space-y-4">
                {participants.map((p, index) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={p.avatarUrl} alt={p.name} />
                        <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        {p.role === 'owner' && (
                          <p className="text-xs text-muted-foreground">
                            Proprietário(a)
                          </p>
                        )}
                      </div>
                    </div>
                    <RemoveParticipantDialog
                      participantName={p.name}
                      goalName={goal.name}
                      disabled={p.role === 'owner'}
                    />
                  </div>
                ))}
              </div>

              <Separator className="my-8" />

              <div>
                <h3 className="font-semibold text-destructive">
                  Zona de Perigo
                </h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Ações nesta seção são permanentes e não podem ser desfeitas.
                </p>
                <DeleteGoalDialog goalId={goal.id} goalName={goal.name} />
              </div>
            </form>
          </CardContent>
           <CardFooter className="border-t pt-6">
                <Button>Salvar Alterações</Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
