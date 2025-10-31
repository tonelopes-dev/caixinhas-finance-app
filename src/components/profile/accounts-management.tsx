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
import { accounts } from '@/lib/data';
import { Landmark, PlusCircle, Trash2, Edit } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { Account } from '@/lib/definitions';

function EditAccountDialog({ account }: { account: Account }) {
    const [open, setOpen] = React.useState(false);
    return (
         <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary"
                >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Editar Conta</DialogTitle>
                <DialogDescription>
                    Atualize os detalhes da sua conta.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="account-name">Nome da Conta</Label>
                    <Input
                    id="account-name"
                    defaultValue={account.name}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bank-name">Nome do Banco</Label>
                    <Input
                    id="bank-name"
                    defaultValue={account.bank}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="account-type">Tipo de Conta</Label>
                    <Select name="account-type" defaultValue={account.type}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="checking">Conta Corrente</SelectItem>
                            <SelectItem value="savings">Poupança</SelectItem>
                            <SelectItem value="investment">Investimento</SelectItem>
                            <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={() => setOpen(false)}>
                    Salvar Alterações
                </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export function AccountsManagement() {
    const [open, setOpen] = React.useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Contas Bancárias</CardTitle>
          <CardDescription>
            Adicione e gerencie as contas que você usa no dia a dia.
          </CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Conta</DialogTitle>
              <DialogDescription>
                Insira os detalhes da nova conta bancária ou carteira.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="account-name">Nome da Conta</Label>
                <Input
                  id="account-name"
                  placeholder="Ex: Conta Corrente"
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="bank-name">Nome do Banco</Label>
                <Input
                  id="bank-name"
                  placeholder="Ex: Banco Digital"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-type">Tipo de Conta</Label>
                <Select name="account-type">
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="checking">Conta Corrente</SelectItem>
                        <SelectItem value="savings">Poupança</SelectItem>
                        <SelectItem value="investment">Investimento</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>
                Salvar Conta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-muted p-2">
                    <Landmark className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{account.name}</p>
                  <p className="text-xs text-muted-foreground">{account.bank} ({account.type})</p>
                </div>
              </div>
              <div className='flex gap-2'>
                <EditAccountDialog account={account} />
                 <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remover</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}