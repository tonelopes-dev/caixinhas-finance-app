
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
          className="text-muted-foreground hover:text-destructive"
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
          <span className="sr-only">Remover</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso removerá{' '}
            <span className="font-bold text-foreground">{guestName}</span> do seu cofre.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Removendo...' : 'Remover'}
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
}

export function GuestsManagement({ members, vaultOwnerId, currentUserId, vaultId }: GuestsManagementProps) {
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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">Gerenciar Membros do Cofre</CardTitle>
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                {members?.length || 0} {members?.length === 1 ? 'membro' : 'membros'}
              </span>
            </div>
            <CardDescription>
              Adicione ou remova pessoas do seu cofre compartilhado.
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={!isCurrentUserOwner}>
                <UserPlus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </DialogTrigger>
          <DialogContent>
            <form action={dispatch} ref={formRef}>
              <input type="hidden" name="vaultId" value={vaultId} />
              <DialogHeader>
                <DialogTitle>Convidar Novo Membro</DialogTitle>
                <DialogDescription>
                  Envie um convite para alguém participar do seu cofre compartilhado.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    O usuário precisa estar cadastrado no sistema para receber o convite.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail do Convidado</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nome@example.com"
                    required
                  />
                  {state?.errors?.email && (
                    <p className="text-sm font-medium text-destructive">
                      {state.errors.email[0]}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
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
                className="group relative flex items-center justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
              >
                {/* Indicador de posição */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-primary/20 to-primary rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity" />
                
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
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary border-2 border-background flex items-center justify-center">
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
                      {isOwner && (
                        <span className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-700/10 dark:ring-amber-300/20">
                          <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Proprietário
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
                  <DeleteGuestDialog 
                    guestName={member.name ?? 'Convidado'} 
                    disabled={!canBeRemoved}
                    onConfirm={() => handleRemoveMember(member.id, member.name ?? 'Convidado')}
                    isLoading={removingUserId === member.id}
                  />
                </div>
              </div>
            )
          }) : (
             <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 p-12 text-center bg-muted/30">
               <div className="flex flex-col items-center gap-3">
                 <div className="rounded-full bg-muted p-4">
                   <UserPlus className="h-8 w-8 text-muted-foreground" />
                 </div>
                 <div>
                   <p className="font-medium text-foreground">
                     Nenhum membro adicional
                   </p>
                   <p className="text-sm text-muted-foreground mt-1">
                     Este cofre ainda não tem outros membros.
                   </p>
                 </div>
                 {isCurrentUserOwner && (
                   <Button 
                     variant="outline" 
                     size="sm" 
                     className="mt-2"
                     onClick={() => setOpen(true)}
                   >
                     <UserPlus className="mr-2 h-4 w-4" />
                     Convidar Primeiro Membro
                   </Button>
                 )}
               </div>
             </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
