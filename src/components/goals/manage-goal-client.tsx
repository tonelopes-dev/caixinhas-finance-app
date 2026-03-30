'use client';

import { useState, useEffect, useActionState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, Users, AlertCircle, Trash2, UserPlus, Check, Settings2, ShieldAlert } from 'lucide-react';
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
import { DashboardBackground } from '@/components/dashboard/dashboard-background';
import { StandardBackButton } from '@/components/ui/standard-back-button';
import { motion } from 'framer-motion';

// O tipo Goal agora inclui os campos userId e vaultId globalmente no definitions.ts

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      disabled={pending || disabled}
      className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest bg-gradient-to-br from-[#ff6b7b] to-[#fa8292] text-white hover:shadow-[#ff6b7b]/40 transition-all shadow-xl border-none"
    >
      {pending ? 'Salvando...' : 'Salvar Alterações'}
    </Button>
  );
}

interface ManageGoalClientProps {
  goal: Goal;
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
  
  const initialOwnerType = goal.vaultId ? 'vault' : 'user';
  const initialOwnerId = goal.vaultId || currentUser.id;
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

  const allParticipants = goal.participants?.map(p => ({
    id: p.user.id,
    name: p.user.name,
    avatarUrl: p.user.avatarUrl || '',
    role: p.role || 'member'
  })) || [];

  const currentUserInParticipants = allParticipants.find(p => p.id === currentUser.id);
  
  const participants = currentUserInParticipants
    ? allParticipants 
    : [
        {
          id: currentUser.id,
          name: currentUser.name || '',
          avatarUrl: currentUser.avatarUrl || '',
          role: 'owner' as const
        },
        ...allParticipants
      ];

  const isVaultOwner = currentVault?.ownerId === currentUser.id;
  const isGoalCreator = goal.userId === currentUser.id;
  
  const isOwner = 
    currentUserInParticipants?.role === 'owner' || 
    goal.ownerId === currentUser.id || 
    isGoalCreator || 
    !!isVaultOwner;

  const ownerName = goal.vaultId ? (currentVault?.name || 'Cofre') : 'Espaço Pessoal';

  const handleVisibilityChange = (newVisibility: Goal['visibility']) => {
    if (newVisibility !== visibility) {
      setPendingVisibility(newVisibility);
    }
  };

  const confirmVisibilityChange = () => {
    if (pendingVisibility) {
      setVisibility(pendingVisibility);
      
      if (pendingVisibility === 'private') {
        setOwnerType('user');
        setOwnerId(currentUser.id);
      } else {
        setOwnerType('vault');
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
    <DashboardBackground>
      <div className="flex min-h-screen w-full flex-col items-center p-4 md:p-10">
        <div className="w-full max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 flex items-center justify-between"
          >
            <StandardBackButton 
              href={`/goals/${goal.id}`} 
              label="Voltar para a Caixinha" 
              className="mb-0" 
            />

            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff6b7b]">Configurações</p>
              <h1 className="text-2xl font-bold font-headline italic text-[#2D241E]">Gerenciar Caixinha</h1>
            </div>
          </motion.div>

          <form action={formAction}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-[#fdfcf7] border-none rounded-[40px] shadow-2xl overflow-hidden">
                <CardHeader className="p-8 pb-4 bg-white/50 backdrop-blur-sm border-b border-[#2D241E]/5 flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold text-[#2D241E] flex items-center gap-2">
                       <Settings2 className="h-5 w-5 text-[#ff6b7b]" />
                       Ajustes Gerais
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-[#2D241E]/40 italic">
                      Você está editando a caixinha em <span className="text-[#ff6b7b] font-bold">{ownerName}</span>
                    </CardDescription>
                  </div>
                  {currentVault ? (
                    <Badge className="bg-[#ff6b7b]/10 text-[#ff6b7b] hover:bg-[#ff6b7b]/20 border-none px-3 py-1 rounded-full font-black uppercase tracking-widest text-[10px]">
                      <Users className="h-3 w-3 mr-1" />
                      Compartilhada
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-[#2D241E]/10 text-[#2D241E]/40 px-3 py-1 rounded-full font-black uppercase tracking-widest text-[10px]">
                      <Lock className="h-3 w-3 mr-1" />
                      Privada
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="p-8 space-y-10">
                  <input type="hidden" name="id" value={goal.id} />
                  <input type="hidden" name="visibility" value={visibility} />
                  <input type="hidden" name="ownerType" value={ownerType} />
                  <input type="hidden" name="ownerId" value={ownerId} />
                  
                  <fieldset disabled={!isOwner} className="space-y-8 disabled:opacity-70">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                      <div className="space-y-3 md:col-span-2">
                        <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">Nome da Caixinha</Label>
                        <Input id="name" name="name" defaultValue={goal.name} className="h-14 rounded-2xl border-2 border-[#2D241E]/5 bg-white text-lg font-bold text-[#2D241E] focus:border-[#ff6b7b] focus:ring-0 transition-all shadow-sm" />
                        {state.errors?.name && <p className="text-xs font-bold text-[#ff6b7b] ml-1">{state.errors.name[0]}</p>}
                      </div>
                      <div className="space-y-3 md:col-span-1 text-center">
                        <Label htmlFor="emoji" className="text-xs font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">Ícone</Label>
                        <Input id="emoji" name="emoji" defaultValue={goal.emoji || ''} maxLength={2} className="text-center text-2xl h-14 rounded-2xl border-2 border-[#2D241E]/5 bg-white focus:border-[#ff6b7b] focus:ring-0 transition-all shadow-sm font-bold" />
                        {state.errors?.emoji && <p className="text-xs font-bold text-[#ff6b7b] ml-1">{state.errors.emoji[0]}</p>}
                      </div>
                      <div className="space-y-3 md:col-span-1">
                        <Label htmlFor="targetAmount" className="text-xs font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">Meta (R$)</Label>
                        <Input 
                          id="targetAmount" 
                          name="targetAmount" 
                          type="text" 
                          inputMode="decimal"
                          defaultValue={goal.targetAmount ? (goal.targetAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'} 
                          className="h-14 rounded-2xl border-2 border-[#2D241E]/5 bg-white text-lg font-bold text-[#2D241E] focus:border-[#ff6b7b] focus:ring-0 transition-all shadow-sm"
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
                        {state.errors?.targetAmount && <p className="text-xs font-bold text-[#ff6b7b] ml-1">{state.errors.targetAmount[0]}</p>}
                      </div>
                    </div>
                  
                    <div className="space-y-4">
                      <Label className="text-xs font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">Visibilidade</Label>
                      <RadioGroup
                        value={visibility}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        onValueChange={(value) => handleVisibilityChange(value as Goal['visibility'])}
                      >
                        <Label
                          htmlFor="shared"
                          className={cn(
                            'flex flex-col items-center justify-center rounded-[32px] border-2 bg-white p-6 hover:bg-[#2D241E]/5 cursor-pointer transition-all duration-300 shadow-sm relative',
                            visibility === 'shared' ? 'border-[#ff6b7b] bg-[#ff6b7b]/5 ring-4 ring-[#ff6b7b]/10 scale-[1.02]' : 'border-[#2D241E]/5'
                          )}
                        >
                          <RadioGroupItem value="shared" id="shared" className="sr-only" />
                          <div className={cn("p-4 rounded-2xl mb-4 transition-colors", visibility === 'shared' ? "bg-[#ff6b7b] text-white" : "bg-[#2D241E]/5 text-[#2D241E]/30")}>
                            <Users className="h-6 w-6" />
                          </div>
                          <span className={cn("font-black uppercase tracking-widest text-[10px]", visibility === 'shared' ? "text-[#ff6b7b]" : "text-[#2D241E]/40")}>Compartilhada</span>
                          <span className="text-[10px] text-center text-[#2D241E]/30 mt-1">Todos no cofre podem ver</span>
                          {visibility === 'shared' && <Check className="absolute top-4 right-4 h-4 w-4 text-[#ff6b7b]" />}
                        </Label>
                        
                        <Label
                          htmlFor="private"
                          className={cn(
                            'flex flex-col items-center justify-center rounded-[32px] border-2 bg-white p-6 hover:bg-[#2D241E]/5 cursor-pointer transition-all duration-300 shadow-sm relative',
                            visibility === 'private' ? 'border-[#ff6b7b] bg-[#ff6b7b]/5 ring-4 ring-[#ff6b7b]/10 scale-[1.02]' : 'border-[#2D241E]/5'
                          )}
                        >
                          <RadioGroupItem value="private" id="private" className="sr-only" />
                          <div className={cn("p-4 rounded-2xl mb-4 transition-colors", visibility === 'private' ? "bg-[#ff6b7b] text-white" : "bg-[#2D241E]/5 text-[#2D241E]/30")}>
                            <Lock className="h-6 w-6" />
                          </div>
                          <span className={cn("font-black uppercase tracking-widest text-[10px]", visibility === 'private' ? "text-[#ff6b7b]" : "text-[#2D241E]/40")}>Privada</span>
                          <span className="text-[10px] text-center text-[#2D241E]/30 mt-1">Apenas convidados</span>
                          {visibility === 'private' && <Check className="absolute top-4 right-4 h-4 w-4 text-[#ff6b7b]" />}
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
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <Label htmlFor="vault-select" className="text-xs font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">Cofre de Destino</Label>
                        <Select
                          value={ownerId}
                          onValueChange={(value) => {
                            setOwnerId(value);
                            setOwnerType('vault');
                          }}
                          disabled={!isOwner}
                        >
                          <SelectTrigger id="vault-select" className="h-14 rounded-2xl border-2 border-[#2D241E]/5 bg-white text-lg font-bold text-[#2D241E] transition-all shadow-sm">
                            <SelectValue placeholder="Selecione um cofre" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-[#2D241E]/5 shadow-xl">
                            {userVaults.map((vault) => (
                              <SelectItem key={vault.id} value={vault.id} className="rounded-xl font-bold text-[#2D241E] focus:bg-[#ff6b7b]/10 focus:text-[#ff6b7b]">
                                {vault.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-[10px] text-purple-600/40 italic ml-1 font-bold">
                          Mover a caixinha altera quem pode vê-la.
                        </p>
                      </motion.div>
                    )}
                  </fieldset>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center px-1">
                      <div>
                        <h3 className="text-lg font-bold text-[#2D241E]">Participantes</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/30">Quem faz parte desta jornada</p>
                      </div>
                      <div className="p-2 rounded-2xl bg-white/50 border border-[#2D241E]/5">
                        <Users className="h-5 w-5 text-[#2D241E]/20" />
                      </div>
                    </div>

                    {!currentVault && (
                      <div className="p-4 rounded-3xl bg-blue-50/50 border border-blue-100 flex items-start gap-4">
                        <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                        <p className="text-xs font-bold text-blue-600/70 leading-relaxed italic">
                          💡 Dica: Mova esta caixinha para um cofre compartilhado para gerenciar os participantes coletivamente.
                        </p>
                      </div>
                    )}

                    <div className="grid gap-3">
                      {participants.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-[24px] bg-white border border-[#2D241E]/5 p-4 shadow-sm group hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 border-2 border-[#2D241E]/5">
                              <AvatarImage src={p.avatarUrl} alt={p.name || 'Usuário'} />
                              <AvatarFallback className="bg-[#ff6b7b]/5 text-[#ff6b7b] font-black">{(p.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-black text-[#2D241E] leading-none mb-1">{p.name || 'Usuário'}</p>
                              {p.role === 'owner' ? (
                                <Badge className="bg-[#2D241E]/5 text-[#2D241E]/40 border-none font-black uppercase tracking-widest text-[8px] px-2">Proprietário(a)</Badge>
                              ) : (
                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black uppercase tracking-widest text-[8px] px-2">Membro</Badge>
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

                  {currentVault && pendingInvitations.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center px-1">
                        <div>
                          <h3 className="text-lg font-bold text-[#2D241E]">Convites Pendentes</h3>
                          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/50">Aguardando entrada no cofre "{currentVault.name}"</p>
                        </div>
                        <div className="p-2 rounded-2xl bg-amber-50">
                          <UserPlus className="h-5 w-5 text-amber-500" />
                        </div>
                      </div>

                      <div className="grid gap-3">
                        {pendingInvitations.map((invitation) => (
                          <div 
                            key={invitation.id} 
                            className="flex items-center justify-between rounded-[24px] bg-amber-50/30 border border-dashed border-amber-200 p-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-white border-2 border-amber-100 flex items-center justify-center">
                                <UserPlus className="h-5 w-5 text-amber-400" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-[#2D241E] leading-none mb-1">
                                  {invitation.receiver?.name || invitation.receiverEmail}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-amber-100 text-amber-700 border-none font-black uppercase tracking-widest text-[8px] px-2">Pendente</Badge>
                                  <span className="text-[10px] text-amber-600/40 font-bold italic">
                                    Enviado em {new Date(invitation.createdAt).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-xl text-amber-400 hover:text-red-500 hover:bg-red-50"
                              onClick={() => handleCancelInvitation(invitation.id)}
                              disabled={!isOwner || isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-[#2D241E]/5">
                    <div className="flex items-center justify-between">
                      <SubmitButton disabled={!isOwner} />
                      {!isOwner && (
                        <div className="flex items-center gap-2 text-[#2D241E]/40">
                          <ShieldAlert className="h-4 w-4" />
                          <p className="text-[10px] font-bold italic tracking-wide">Apenas o proprietário pode salvar alterações.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-10">
                    <div className="rounded-[32px] bg-red-50/30 border border-red-100 p-8 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-white border border-red-100 shadow-sm">
                          <Trash2 className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-red-900 leading-none mb-1">Zona Crítica</h3>
                          <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Tenha certeza absoluta antes de prosseguir</p>
                        </div>
                      </div>
                      
                      {goal.currentAmount > 0 ? (
                        <div className="p-4 rounded-2xl bg-white border border-red-200 flex items-start gap-4">
                          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-red-900 mb-1">Atenção ao Saldo!</p>
                            <p className="text-xs text-red-700/70 font-medium leading-relaxed italic">
                              Esta caixinha possui **R$ {goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** guardados. 
                              Ao deletar, todo o histórico e progresso serão perdidos permanentemente.
                            </p>
                          </div>
                        </div>
                      ) : (
                         <p className="text-xs text-red-700/60 font-medium italic px-1">
                          Esta ação é irreversível. Todas as transações associadas serão apagadas.
                        </p>
                      )}
                      
                      <div className="flex justify-start">
                        <DeleteGoalDialog goalId={goal.id} goalName={goal.name} disabled={!isOwner} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </form>
        </div>
      </div>
    </DashboardBackground>
  );
}
