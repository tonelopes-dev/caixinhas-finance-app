'use client';

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
import { Button, buttonVariants } from '@/components/ui/button';
import type { Invitation } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export function DeclineInvitationDialog({ invitation }: { invitation: Invitation }) {

  const handleDecline = () => {
    // Em uma aplicação real, aqui você despacharia uma server action para recusar o convite.
    console.log(`Convite "${invitation.goalName}" recusado.`);
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon" className='h-8 w-8'>
            <X className="h-4 w-4" />
            <span className="sr-only">Recusar</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Você irá recusar o convite de <span className="font-bold">{invitation.invitedBy}</span> para {invitation.type === 'vault' ? 'o cofre' : 'a caixinha'} <span className="font-bold text-foreground">{invitation.goalName}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='mt-4'>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDecline} className={cn(buttonVariants({ variant: "destructive" }))}>Recusar</AlertDialogAction>
          </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
