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
import React from 'react';

export function InviteParticipantDialog({ goalName }: { goalName: string }) {
  const [open, setOpen] = React.useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Em uma aplicação real, aqui você despacharia uma server action para enviar o convite.
    console.log('Convite enviado!');
    setOpen(false);
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
        <form onSubmit={handleSubmit}>
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
                type="email"
                placeholder="nome@example.com"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              <Send className="mr-2 h-4 w-4" />
              Enviar Convite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
