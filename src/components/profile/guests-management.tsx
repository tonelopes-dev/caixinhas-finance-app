
'use client';

import React, { useActionState, useRef, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { inviteMemberAction, removeMemberAction, type InviteMemberState } from '@/app/profile/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Send } from 'lucide-react';
import type { User } from '@/lib/definitions';

function DeleteGuestDialog({ 
  guestName, 
  disabled, 
  onConfirm, 
  isLoading 
}: { 
  guestName: string; 
  disabled: boolean; 
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          disabled={disabled || isLoading}
          title={disabled ? 'Você não tem permissão para remover este membro' : 'Remover membro'}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
          <span className="sr-only">Remover</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-destructive/10 p-3">
              <svg className="h-5 w-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <AlertDialogTitle className="text-xl">Remover Membro</AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                Esta ação não pode ser desfeita
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        
        <div className="py-4">
          <div className="rounded-lg bg-muted p-4 border">
            <p className="text-sm text-foreground">
              Você está prestes a remover{' '}
              <span className="font-semibold text-primary">{guestName}</span>{' '}
              do cofre compartilhado.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Após a remoção, este usuário perderá todo o acesso às informações e transações deste cofre.
            </p>
          </div>
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Removendo...
              </>
            ) : (
              <>
                <X className="h-4 w-4" />
                Remover Membro
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface GuestsManagementProps {
  members: User[];
  vaultOwnerId: string;
  currentUserId: string;
  vaultId: string;
  currentUser?: User;
}

export function GuestsManagement({ members, vaultOwnerId, currentUserId, vaultId, currentUser }: GuestsManagementProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();
  const [removingUserId, setRemovingUserId] = React.useState<string | null>(null);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const isCurrentUserOwner = vaultOwnerId === currentUserId;

  const initialState: InviteMemberState = {};
  const [state, dispatch] = useActionState(inviteMemberAction, initialState);

  React.useEffect(() => {
    if (state.message && !state.errors) {
      toast({ title: 'Sucesso!', description: state.message });
      formRef.current?.reset();
      setOpen(false);
    } else if (state.message && state.errors) {
      toast({
        title: 'Erro',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  const handleRemoveMember = (userId: string, userName: string) => {
    setRemovingUserId(userId);
    startTransition(async () => {
      try {
        const result = await removeMemberAction(vaultId, userId);
        if (result.success) {
          toast({
            title: 'Sucesso!',
            description: result.message,
          });
        } else {
          toast({
            title: 'Erro',
            description: result.message,
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro ao remover o membro.',
          variant: 'destructive',
        });
      } finally {
        setRemovingUserId(null);
      }
    });
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Membros do Cofre</CardTitle>
                <CardDescription className="text-sm mt-0.5">
                  Gerencie quem tem acesso a este cofre
                </CardDescription>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="font-medium">{members?.length || 0}</span>
                <span className="text-muted-foreground">
                  {members?.length === 1 ? 'membro ativo' : 'membros ativos'}
                </span>
              </div>
            </div>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                disabled={!isCurrentUserOwner}
                className="gap-2 shadow-sm"
              >
                <UserPlus className="h-4 w-4" />
                Adicionar Membro
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form action={dispatch} ref={formRef}>
              <input type="hidden" name="vaultId" value={vaultId} />
              <DialogHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-3">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">Convidar Novo Membro</DialogTitle>
                    <DialogDescription className="text-sm">
                      Adicione alguém ao seu cofre compartilhado
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="grid gap-5 py-6">
                {/* Info alert */}
                <div className="rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 p-4 border border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex gap-3">
                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Requisito para convite
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        O usuário precisa estar cadastrado no sistema para receber o convite. Uma notificação será enviada automaticamente.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Email input */}
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium">
                    E-mail do Convidado
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="exemplo@email.com"
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                  {state?.errors?.email && (
                    <div className="flex items-center gap-2 text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg">
                      <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {state.errors.email[0]}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando convite...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar Convite
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {members && members.length > 0 ? members.map((member, index) => {
            const isOwner = member.id === vaultOwnerId;
            const isSelf = member.id === currentUserId;
            // Só o dono do cofre pode remover outros. Ninguém pode remover o dono.
            const canBeRemoved = isCurrentUserOwner && !isOwner;

            return (
              <div
                key={member.id}
                className={`group relative flex items-center justify-between rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${
                  isSelf 
                    ? 'bg-primary/5 border-primary/20' 
                    : 'bg-card border-border hover:border-primary/50'
                }`}
              >
                {/* Indicador de posição */}
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-primary/20 to-primary rounded-r-full transition-opacity ${
                  isSelf ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`} />
                
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Avatar com indicador online */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12 border-2 border-primary/20 ring-2 ring-background shadow-sm">
                      <AvatarImage src={member.avatarUrl || undefined} alt={member.name ?? 'Usuário'} />
                      <AvatarFallback className="text-base font-semibold bg-gradient-to-br from-primary/20 to-primary/10">
                        {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {isOwner && (
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary border-2 border-background flex items-center justify-center" title="Proprietário">
                        <svg className="h-3 w-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Info do membro */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-semibold text-base truncate">{member.name}</h4>
                      {isSelf && (
                        <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-300/20">
                          Você
                        </span>
                      )}
                      {isOwner ? (
                        <span className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-700/10 dark:ring-amber-300/20">
                          <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Proprietário
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400 ring-1 ring-inset ring-slate-500/10 dark:ring-slate-400/20">
                          Membro
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {member.email}
                    </p>
                  </div>
                </div>

                {/* Botão de remover */}
                <div className="flex-shrink-0">
                  {!isOwner && (
                    <DeleteGuestDialog 
                      guestName={member.name ?? 'Convidado'} 
                      disabled={!canBeRemoved}
                      onConfirm={() => handleRemoveMember(member.id, member.name ?? 'Convidado')}
                      isLoading={removingUserId === member.id}
                    />
                  )}
                </div>
              </div>
            )
          }) : (
             <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 bg-gradient-to-br from-muted/50 to-muted/30 overflow-hidden">
               {/* Header com info do proprietário */}
               {currentUser && (
                 <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-dashed border-muted-foreground/25 p-6">
                   <div className="flex items-center gap-4">
                     <Avatar className="h-16 w-16 border-2 border-primary/30 ring-4 ring-background shadow-lg">
                       <AvatarImage src={currentUser.avatarUrl || undefined} alt={currentUser.name} />
                       <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary/30 to-primary/20">
                         {currentUser.name.charAt(0).toUpperCase()}
                       </AvatarFallback>
                     </Avatar>
                     <div className="flex-1">
                       <div className="flex items-center gap-2 mb-1">
                         <h3 className="font-semibold text-lg">{currentUser.name}</h3>
                         <span className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-700/10 dark:ring-amber-300/20">
                           <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                             <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                           </svg>
                           Proprietário
                         </span>
                       </div>
                       <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                         <svg className="h-3.5 w-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                         </svg>
                         {currentUser.email}
                       </p>
                     </div>
                   </div>
                 </div>
               )}
               
               {/* Área de convite */}
               <div className="p-12 text-center">
                 <div className="flex flex-col items-center gap-4">
                   <div className="rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-6 shadow-inner">
                     <UserPlus className="h-10 w-10 text-primary" />
                   </div>
                   <div>
                     <p className="font-semibold text-lg text-foreground">
                       Nenhum membro adicional
                     </p>
                     <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                       {isCurrentUserOwner 
                         ? 'Convide pessoas para colaborar e gerenciar este cofre junto com você.'
                         : 'Este cofre ainda não tem outros membros além do proprietário.'
                       }
                     </p>
                   </div>
                   {isCurrentUserOwner && (
                     <Button 
                       size="default" 
                       className="mt-2 shadow-md gap-2"
                       onClick={() => setOpen(true)}
                     >
                       <UserPlus className="h-4 w-4" />
                       Convidar Primeiro Membro
                     </Button>
                   )}
                 </div>
               </div>
             </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
