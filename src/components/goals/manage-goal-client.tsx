'use client';

import { useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { updateGoalAction } from '@/app/(private)/goals/actions';
import { InviteParticipantDialog } from '@/components/goals/invite-participant-dialog';
import { DeleteGoalDialog } from '@/components/goals/delete-goal-dialog';
import { RemoveParticipantDialog } from '@/components/goals/remove-participant-dialog';
import { VisibilityChangeDialog } from '@/components/goals/visibility-change-dialog';
import type { Goal, Vault, User } from '@/lib/definitions';

// Estendendo o tipo Goal para incluir os campos do Prisma
type ExtendedGoal = Goal & {
  userId?: string | null;
  vaultId?: string | null;
};

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? 'Salvando...' : 'Salvar Alterações'}
    </Button>
  );
}

interface ManageGoalClientProps {
  goal: ExtendedGoal;
  currentUser: User;
  currentVault: Vault | null;
  userVaults: Vault[];
}

const initialState = { message: '', errors: undefined, success: false };

export function ManageGoalClient({ goal, currentUser, currentVault, userVaults }: ManageGoalClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [visibility, setVisibility] = useState<Goal['visibility']>(goal.visibility || 'shared');
  const [pendingVisibility, setPendingVisibility] = useState<Goal['visibility'] | null>(null);
  
  // Determine initial owner
  const initialOwnerType = goal.vaultId ? 'vault' : 'user';
  const initialOwnerId = goal.vaultId || currentUser.id;

  const [ownerType, setOwnerType] = useState<'user' | 'vault'>(initialOwnerType);
  const [ownerId, setOwnerId] = useState<string>(initialOwnerId);

  const [state, formAction] = useActionState(updateGoalAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast({ title: "Sucesso!", description: state.message });
    } else if (state.message) {
      toast({ title: "Erro", description: state.message, variant: 'destructive' });
    }
  }, [state, toast]);

  const participants = [{
    id: currentUser.id,
    name: currentUser.name || '',
    avatarUrl: currentUser.avatarUrl || '',
    role: 'owner' as const
  }];

  // Lógica corrigida para determinar o proprietário e contexto
  const isPersonal = goal.userId ? true : (goal.ownerType === 'user');
  
  const isOwner = isPersonal 
    ? goal.userId === currentUser.id
    : currentVault?.ownerId === currentUser.id;

  const ownerName = isPersonal ? 'Espaço Pessoal' : (currentVault?.name || 'Cofre');

  const handleVisibilityChange = (newVisibility: Goal['visibility']) => {
    if (newVisibility !== visibility) {
      setPendingVisibility(newVisibility);
    }
  };

  const confirmVisibilityChange = () => {
    if (pendingVisibility) {
      setVisibility(pendingVisibility);
      
      // Logic to switch owner based on visibility
      if (pendingVisibility === 'private') {
        setOwnerType('user');
        setOwnerId(currentUser.id);
      } else {
        // If switching to shared, default to current vault or first available vault
        if (ownerType === 'user') {
           setOwnerType('vault');
           // Prefer current vault if available, otherwise first vault
           const targetVaultId = currentVault?.id || userVaults[0]?.id || '';
           setOwnerId(targetVaultId);
        }
      }

      setPendingVisibility(null);
    }
  };

  const cancelVisibilityChange = () => {
    setPendingVisibility(null);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-4 flex items-center">
          <Button asChild variant="ghost">
            <Link href={`/goals/${goal.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Caixinha
            </Link>
          </Button>
        </div>

        <form action={formAction}>
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Caixinha</CardTitle>
              <CardDescription>
                Ajuste os detalhes da caixinha localizada em <span className="font-medium text-primary">{ownerName}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <input type="hidden" name="id" value={goal.id} />
              <input type="hidden" name="visibility" value={visibility} />
              <input type="hidden" name="ownerType" value={ownerType} />
              <input type="hidden" name="ownerId" value={ownerId} />
              
              <fieldset disabled={!isOwner} className="space-y-6 disabled:opacity-70">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">Nome da Caixinha</Label>
                    <Input id="name" name="name" defaultValue={goal.name} />
                    {state.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name[0]}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="emoji">Ícone (Emoji)</Label>
                    <Input id="emoji" name="emoji" defaultValue={goal.emoji || ''} maxLength={2} className="text-center text-2xl h-14" />
                    {state.errors?.emoji && <p className="text-sm font-medium text-destructive">{state.errors.emoji[0]}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="targetAmount">Valor da Meta</Label>
                    <Input 
                      id="targetAmount" 
                      name="targetAmount" 
                      type="text" 
                      inputMode="decimal"
                      defaultValue={goal.targetAmount ? (goal.targetAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'} 
                      className="h-14"
                      onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value) {
                            const numberValue = Number(value) / 100;
                            e.target.value = numberValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                          } else {
                            e.target.value = '';
                          }
                      }}
                    />
                    {state.errors?.targetAmount && <p className="text-sm font-medium text-destructive">{state.errors.targetAmount[0]}</p>}
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
                      <RadioGroupItem value="shared" id="shared" className="sr-only" />
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
                      <RadioGroupItem value="private" id="private" className="sr-only" />
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

                {visibility === 'shared' && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label htmlFor="vault-select">Cofre da Caixinha</Label>
                    <Select
                      value={ownerId}
                      onValueChange={(value) => {
                        setOwnerId(value);
                        setOwnerType('vault');
                      }}
                      disabled={!isOwner}
                    >
                      <SelectTrigger id="vault-select">
                        <SelectValue placeholder="Selecione um cofre" />
                      </SelectTrigger>
                      <SelectContent>
                        {userVaults.map((vault) => (
                          <SelectItem key={vault.id} value={vault.id}>
                            {vault.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Escolha em qual cofre esta caixinha ficará visível.
                    </p>
                  </div>
                )}
              </fieldset>

              <Separator />

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Participantes</h3>
                  <InviteParticipantDialog 
                    goalName={goal.name} 
                    disabled={!isOwner} 
                    vaultId={currentVault?.id}
                    vaultName={currentVault?.name}
                  />
                </div>
                <div className="space-y-4">
                  {participants.map((p) => (
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
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg text-destructive">Zona de Perigo</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Ações nesta seção são permanentes e não podem ser desfeitas.
                </p>
                <DeleteGoalDialog goalId={goal.id} goalName={goal.name} disabled={!isOwner} />
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <div className="flex items-center">
                <SubmitButton disabled={!isOwner} />
                {!isOwner && <p className="text-sm text-muted-foreground ml-4">Apenas o proprietário da caixinha pode salvar as alterações.</p>}
              </div>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
