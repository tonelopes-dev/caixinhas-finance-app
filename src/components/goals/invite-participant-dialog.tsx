'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, UserPlus } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { sendGoalInvite } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { inviteToVaultAction } from '@/app/vaults/actions';

interface InviteParticipantDialogProps {
  goalName: string;
  disabled?: boolean;
  vaultId?: string | null;
  vaultName?: string | null;
}

export function InviteParticipantDialog({ goalName, disabled, vaultId, vaultName }: InviteParticipantDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [showVaultConfirmation, setShowVaultConfirmation] = React.useState(false);
  const [pendingEmail, setPendingEmail] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;

    if (vaultId) {
      setPendingEmail(email);
      setShowVaultConfirmation(true);
      setOpen(false);
    } else {
      processInvite(email);
    }
  };

  const processInvite = (email: string) => {
    startTransition(async () => {
        let result;
        
        if (vaultId) {
           result = await inviteToVaultAction(vaultId, email);
        } else {
           result = await sendGoalInvite(email, goalName);
        }

        const isSuccess = 'success' in result ? result.success : result.message.includes('sucesso');

        if (result.message) {
            toast({
                title: isSuccess ? 'Sucesso!' : 'Erro',
                description: result.message,
                variant: isSuccess ? 'default' : 'destructive',
            });
        }
        formRef.current?.reset();
        setOpen(false);
        setShowVaultConfirmation(false);
        setPendingEmail(null);
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={disabled}>
            <UserPlus className="mr-2 h-4 w-4" />
            Convidar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={handleSubmit} ref={formRef}>
            <DialogHeader>
              <DialogTitle>Convidar para: {goalName}</DialogTitle>
              <DialogDescription>
                Envie um convite por e-mail para alguém participar desta caixinha com você.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail do Convidado</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nome@example.com"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                <Send className="mr-2 h-4 w-4" />
                {isPending ? 'Enviando...' : 'Enviar Convite'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showVaultConfirmation} onOpenChange={setShowVaultConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Convidar para o Cofre?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta caixinha faz parte do cofre <strong>{vaultName}</strong>. 
              Ao convidar alguém, essa pessoa será adicionada ao cofre inteiro e terá acesso a todas as caixinhas compartilhadas nele.
              <br/><br/>
              Deseja continuar e enviar o convite para o cofre?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowVaultConfirmation(false); setOpen(true); }}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => pendingEmail && processInvite(pendingEmail)}>
              Confirmar e Convidar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
