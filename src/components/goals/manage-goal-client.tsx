'use client';

import { useState, useEffect, useActionState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, Users, AlertCircle, Trash2, UserPlus } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  pendingInvitations: Array<{
    id: string;
    receiverEmail: string | null;
    createdAt: Date;
    receiver: {
      name: string;
      email: string;
      avatarUrl: string | null;
    } | null;
  }>;
}

const initialState = { message: '', errors: undefined, success: false };

export function ManageGoalClient({ goal, currentUser, currentVault, userVaults, pendingInvitations }: ManageGoalClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  // Determine initial owner baseado nos dados reais da goal
  const initialOwnerType = goal.vaultId ? 'vault' : 'user';
  const initialOwnerId = goal.vaultId || currentUser.id;
  // IMPORTANTE: Usar goal.visibility se existir, senão calcular baseado no tipo
  const initialVisibility: Goal['visibility'] = goal.visibility || (initialOwnerType === 'vault' ? 'shared' : 'private');
  
  const [visibility, setVisibility] = useState<Goal['visibility']>(initialVisibility);
  const [pendingVisibility, setPendingVisibility] = useState<Goal['visibility'] | null>(null);
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

  // Montar lista de participantes do banco, garantindo que o owner apareça primeiro
  const allParticipants = goal.participants?.map(p => ({
    id: p.user.id,
    name: p.user.name,
    avatarUrl: p.user.avatarUrl || '',
    role: p.role || 'member'
  })) || [];

  // Verificar se o currentUser já está nos participantes
  const currentUserInParticipants = allParticipants.find(p => p.id === currentUser.id);
  
  const participants = currentUserInParticipants
    ? allParticipants // Usar apenas os participantes do banco (já inclui o owner)
    : [
        // Se o owner não estiver nos participantes, adicionar manualmente
        {
          id: currentUser.id,
          name: currentUser.name || '',
          avatarUrl: currentUser.avatarUrl || '',
          role: 'owner' as const
        },
        ...allParticipants
      ];

  // Lógica corrigida: verificar se o usuário é owner pela lista de participantes
  const isOwner = currentUserInParticipants?.role === 'owner' || goal.ownerId === currentUser.id;

  const ownerName = goal.vaultId ? (currentVault?.name || 'Cofre') : 'Espaço Pessoal';

  const handleVisibilityChange = (newVisibility: Goal['visibility']) => {
    if (newVisibility !== visibility) {
      setPendingVisibility(newVisibility);
    }
  };

  const confirmVisibilityChange = () => {
    if (pendingVisibility) {
      setVisibility(pendingVisibility);
      
      // Sincronizar owner com visibilidade
      if (pendingVisibility === 'private') {
        // Privada -> sempre user
        setOwnerType('user');
        setOwnerId(currentUser.id);
      } else {
        // Compartilhada -> sempre vault
        setOwnerType('vault');
        // Se já tinha um vault, manter; senão usar o primeiro disponível
        const targetVaultId = (ownerType === 'vault' ? ownerId : undefined) || userVaults[0]?.id || '';
        setOwnerId(targetVaultId);
      }

      setPendingVisibility(null);
    }
  };

  const cancelVisibilityChange = () => {
    setPendingVisibility(null);
  };

  const handleCancelInvitation = async (invitationId: string) => {
    startTransition(async () => {
      try {
        const { cancelGoalRelatedInvitation } = await import('@/app/(private)/goals/actions');
        const result = await cancelGoalRelatedInvitation(invitationId, goal.id);
        
        if (result.success) {
          toast({ title: 'Sucesso!', description: result.message });
          router.refresh();
        } else {
          toast({ title: 'Erro', description: result.message, variant: 'destructive' });
        }
      } catch (error) {
        toast({ title: 'Erro', description: 'Erro ao cancelar convite', variant: 'destructive' });
      }
    });
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
              <CardDescription className="flex flex-wrap items-center gap-2">
                Ajuste os detalhes da caixinha localizada em{' '}
                <span className="font-medium text-primary">{ownerName}</span>
                {currentVault ? (
                  <Badge variant="secondary" className="ml-2">
                    <Users className="h-3 w-3 mr-1" />
                    Compartilhada
                  </Badge>
                ) : (
                  <Badge variant="outline" className="ml-2">
                    <Lock className="h-3 w-3 mr-1" />
                    Pessoal
                  </Badge>
                )}
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
                    value={visibility}
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
                  <div className="flex flex-col items-end gap-2">
                    {!currentVault ? (
                      <p className="text-xs text-muted-foreground text-right max-w-xs">
                        💡 Para gerenciar participantes, mova esta caixinha para um cofre compartilhado.
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground text-right max-w-xs">
                        💡 Convites são enviados para o cofre "{currentVault.name}" através da página de gerenciamento do cofre.
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  {participants.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={p.avatarUrl} alt={p.name || 'Usuário'} />
                          <AvatarFallback>{(p.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{p.name || 'Usuário'}</p>
                          {p.role === 'owner' && (
                            <p className="text-xs text-muted-foreground">
                              Proprietário(a)
                            </p>
                          )}
                        </div>
                      </div>
                      <RemoveParticipantDialog
                        participantId={p.id}
                        participantName={p.name || 'Usuário'}
                        goalId={goal.id}
                        goalName={goal.name}
                        disabled={p.role === 'owner' || !isOwner}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex items-center">
                <SubmitButton disabled={!isOwner} />
                {!isOwner && <p className="text-sm text-muted-foreground ml-4">Apenas o proprietário da caixinha pode salvar as alterações.</p>}
              </div>

              {/* Seção de Convites Pendentes */}
              {currentVault && pendingInvitations.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Convites Pendentes do Cofre</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Pessoas que foram convidadas para o cofre "{currentVault.name}" mas ainda não aceitaram.
                      Quando aceitarem, terão acesso a esta caixinha.
                    </p>
                    <div className="space-y-3">
                      {pendingInvitations.map((invitation) => (
                        <div 
                          key={invitation.id} 
                          className="flex items-center justify-between rounded-lg border border-dashed p-3 bg-muted/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <UserPlus className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {invitation.receiver?.name || invitation.receiverEmail}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs h-5 px-2 bg-yellow-500/10 text-yellow-600 border-yellow-200">
                                  Pendente
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(invitation.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleCancelInvitation(invitation.id)}
                            disabled={!isOwner || isPending}
                            title="Cancelar convite"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <h3 className="font-semibold text-lg text-destructive">Zona de Perigo</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Ações nesta seção são permanentes e não podem ser desfeitas.
                </p>
                
                {goal.currentAmount > 0 && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Atenção!</AlertTitle>
                    <AlertDescription>
                      Esta caixinha possui R$ {goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} guardados.
                      Ao deletar, todo o histórico e o progresso serão perdidos permanentemente.
                    </AlertDescription>
                  </Alert>
                )}
                
                <DeleteGoalDialog goalId={goal.id} goalName={goal.name} disabled={!isOwner} />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
