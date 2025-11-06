
'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, X } from 'lucide-react';
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

function DeleteGuestDialog({ guestName, disabled }: { guestName: string; disabled: boolean }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          disabled={disabled}
        >
          <X className="h-4 w-4" />
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
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Remover</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface GuestsManagementProps {
  members: User[];
  vaultOwnerId: string;
  currentUserId: string;
}

export function GuestsManagement({ members, vaultOwnerId, currentUserId }: GuestsManagementProps) {
  const [open, setOpen] = React.useState(false);
  const isCurrentUserOwner = vaultOwnerId === currentUserId;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gerenciar Membros do Cofre</CardTitle>
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
            <DialogHeader>
              <DialogTitle>Convidar Novo Membro</DialogTitle>
              <DialogDescription>
                Envie um convite para alguém participar do seu cofre.
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
              <Button onClick={() => setOpen(false)}>
                <Send className="mr-2 h-4 w-4" />
                Enviar Convite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => {
            const isOwner = member.id === vaultOwnerId;
            const isSelf = member.id === currentUserId;
            // Só o dono do cofre pode remover outros. Ninguém pode remover o dono.
            const canBeRemoved = isCurrentUserOwner && !isOwner;

            return (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name} {isSelf && '(Você)'}</p>
                    <p className="text-xs text-muted-foreground">{isOwner ? 'Proprietário(a)' : 'Membro'}</p>
                  </div>
                </div>
                <DeleteGuestDialog guestName={member.name} disabled={!canBeRemoved} />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  );
}
