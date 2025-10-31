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

export function InviteParticipantDialog({ goalName }: { goalName: string }) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;

    startTransition(async () => {
        const result = await sendGoalInvite(email, goalName);
        if (result.message) {
            toast({
                title: result.message.includes('sucesso') ? 'Sucesso!' : 'Erro',
                description: result.message,
                variant: result.message.includes('sucesso') ? 'default' : 'destructive',
            });
        }
        formRef.current?.reset();
        setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
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
  );
}
