
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
import { UserPlus, X, Loader2, Send, Crown, Mail } from 'lucide-react';
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
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover Membro</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja remover <span className="font-semibold text-foreground">{guestName}</span> do cofre? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Remover'}
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
          toast({ title: 'Sucesso!', description: result.message });
        } else {
          toast({ title: 'Erro', description: result.message, variant: 'destructive' });
        }
      } catch (error) {
        toast({ title: 'Erro', description: 'Ocorreu um erro ao remover o membro.', variant: 'destructive' });
      } finally {
        setRemovingUserId(null);
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Membros do Cofre</CardTitle>
          <CardDescription>Gerencie quem tem acesso a este cofre.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={!isCurrentUserOwner}>
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Membro
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form action={dispatch} ref={formRef}>
              <input type="hidden" name="vaultId" value={vaultId} />
              <DialogHeader>
                <DialogTitle>Convidar Novo Membro</DialogTitle>
                <DialogDescription>
                  O usuário precisa ter uma conta no sistema para ser convidado.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail do Convidado</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="exemplo@email.com"
                    required
                  />
                  {state?.errors?.email && (
                    <p className="text-sm font-medium text-destructive">{state.errors.email[0]}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending} className="gap-2">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Enviar Convite
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members && members.length > 0 ? members.map((member) => {
            const isOwner = member.id === vaultOwnerId;
            const isSelf = member.id === currentUserId;
            const canBeRemoved = isCurrentUserOwner && !isOwner;

            return (
              <div key={member.id} className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.avatarUrl || undefined} alt={member.name ?? 'Usuário'} />
                  <AvatarFallback>{member.name ? member.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none">{member.name}</p>
                    {isSelf && (
                      <span className="text-xs text-muted-foreground">(Você)</span>
                    )}
                    {isOwner && (
                      <Crown className="h-4 w-4 text-amber-500" title="Proprietário" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                     <Mail className="h-3 w-3" />
                    <span>{member.email}</span>
                  </div>
                </div>
                {isCurrentUserOwner && (
                  <DeleteGuestDialog 
                    guestName={member.name ?? 'Convidado'} 
                    disabled={!canBeRemoved}
                    onConfirm={() => handleRemoveMember(member.id, member.name ?? 'Convidado')}
                    isLoading={removingUserId === member.id}
                  />
                )}
              </div>
            );
          }) : (
            <div className="text-center text-sm text-muted-foreground py-8">
              <p>Nenhum membro convidado ainda.</p>
              <p>Adicione membros para compartilhar o acesso a este cofre.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
