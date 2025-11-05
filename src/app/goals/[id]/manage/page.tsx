
'use client';

import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
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
import { goals, user as mockUser, partner } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { InviteParticipantDialog } from '@/components/goals/invite-participant-dialog';
import { DeleteGoalDialog } from '@/components/goals/delete-goal-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useActionState, useEffect, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { RemoveParticipantDialog } from '@/components/goals/remove-participant-dialog';
import { VisibilityChangeDialog } from '@/components/goals/visibility-change-dialog';
import type { Goal } from '@/lib/definitions';
import { Input } from '@/components/ui/input';
import { updateGoal, type UpdateGoalState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';


function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? 'Salvando...' : 'Salvar Alterações'}
    </Button>
  );
}

export default function ManageGoalPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const goal = goals.find((g) => g.id === params.id);
  
  const [visibility, setVisibility] = useState<Goal['visibility']>(goal?.visibility || 'shared');
  const [pendingVisibility, setPendingVisibility] = useState<Goal['visibility'] | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const initialState: UpdateGoalState = { message: null, errors: {} };
  const [state, formAction] = useActionState(updateGoal, initialState);
  
  useEffect(() => {
    // In a real app, this would come from an auth context
    setCurrentUserId(localStorage.getItem('DREAMVAULT_USER_ID'));
  }, []);

  useEffect(() => {
    if (state?.message && !state.errors) {
      toast({ title: "Sucesso!", description: state.message });
      router.push(`/goals/${goal?.id}`);
    } else if (state?.message && state.errors) {
      toast({ title: "Erro de Validação", description: state.message, variant: 'destructive' });
    }
  }, [state, toast, router, goal?.id]);


  if (!goal) {
    notFound();
  }

  const defaultParticipants = [
      { id: 'user1', name: mockUser.name, avatarUrl: mockUser.avatarUrl, role: 'owner' as const },
      { id: 'user2', name: partner.name, avatarUrl: partner.avatarUrl, role: 'member' as const },
  ]

  const participants = goal.participants ?? (goal.visibility === 'shared' ? defaultParticipants : [defaultParticipants[0]]);
  
  const isOwner = goal.ownerId === currentUserId;


  const handleVisibilityChange = (newVisibility: Goal['visibility']) => {
    if (newVisibility !== visibility) {
      setPendingVisibility(newVisibility);
    }
  };

  const confirmVisibilityChange = () => {
    if (pendingVisibility) {
      setVisibility(pendingVisibility);
      setPendingVisibility(null);
    }
  };

  const cancelVisibilityChange = () => {
    setPendingVisibility(null);
  };


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
          <form action={formAction}>
             <input type="hidden" name="id" value={goal.id} />
             <input type="hidden" name="visibility" value={visibility} />
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                Gerenciar Caixinha
              </CardTitle>
              <CardDescription>
                Ajuste o nome, ícone, visibilidade, participantes e
                outras opções da sua caixinha.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <fieldset disabled={!isOwner} className="space-y-6 disabled:opacity-70">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="name">Nome da Caixinha</Label>
                            <Input id="name" name="name" defaultValue={goal.name} />
                             {state?.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name[0]}</p>}
                        </div>
                         <div className="space-y-2 md:col-span-1">
                            <Label htmlFor="emoji">Ícone (Emoji)</Label>
                            <Input id="emoji" name="emoji" defaultValue={goal.emoji} maxLength={2} className="text-center text-2xl h-14" />
                            {state?.errors?.emoji && <p className="text-sm font-medium text-destructive">{state.errors.emoji[0]}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-1">
                            <Label htmlFor="targetAmount">Valor da Meta</Label>
                            <Input id="targetAmount" name="targetAmount" type="number" step="0.01" defaultValue={goal.targetAmount} className="h-14"/>
                            {state?.errors?.targetAmount && <p className="text-sm font-medium text-destructive">{state.errors.targetAmount[0]}</p>}
                        </div>
                    </div>
                
                    <div className="space-y-3">
                        <Label className="font-semibold">Visibilidade da Caixinha</Label>
                        <RadioGroup
                        defaultValue={visibility}
                        className="grid grid-cols-2 gap-4"
                        onValueChange={(value) => handleVisibilityChange(value as Goal['visibility'])}
                        >
                        <Label
                            htmlFor="shared"
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
                            htmlFor="private"
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
                        <VisibilityChangeDialog
                            open={!!pendingVisibility}
                            newVisibility={pendingVisibility}
                            onConfirm={confirmVisibilityChange}
                            onCancel={cancelVisibilityChange}
                        />
                    </div>
                </fieldset>

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
                      participantId={p.id}
                      participantName={p.name}
                      goalId={goal.id}
                      goalName={goal.name}
                      disabled={p.role === 'owner' || !isOwner}
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
                <DeleteGoalDialog goalId={goal.id} goalName={goal.name} disabled={!isOwner} />
              </div>
            </CardContent>
           <CardFooter className="border-t pt-6">
                <SubmitButton disabled={!isOwner} />
                {!isOwner && <p className="text-sm text-muted-foreground ml-4">Apenas o proprietário da caixinha pode salvar as alterações.</p>}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
