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
import { guests } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, X } from 'lucide-react';
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

export function GuestsManagement() {
    const [open, setOpen] = React.useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gerenciar Convidados</CardTitle>
          <CardDescription>
            Adicione ou remova pessoas das suas caixinhas.
          </CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Nova Pessoa</DialogTitle>
              <DialogDescription>
                Envie um convite para alguém participar das suas caixinhas.
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
          {guests.map((guest) => (
            <div
              key={guest.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={guest.avatarUrl} alt={guest.name} />
                  <AvatarFallback>{guest.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{guest.name}</p>
                  <p className="text-xs text-muted-foreground">{guest.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remover</span>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
