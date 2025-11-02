'use client';

import React from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { accounts, bankLogos } from '@/lib/data';
import { Landmark, PlusCircle, Trash2, Edit, CreditCard } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { Account } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { Wallet } from 'lucide-react';


const accountTypeLabels: Record<Account['type'], string> = {
    checking: 'Conta Corrente',
    savings: 'Poupança',
    investment: 'Investimento',
    credit_card: 'Cartão de Crédito',
    other: 'Outro',
}

function EditAccountDialog({ account }: { account: Account }) {
    const [open, setOpen] = React.useState(false);
    const [selectedLogo, setSelectedLogo] = React.useState(account.logoUrl);
    const [accountType, setAccountType] = React.useState<Account['type']>(account.type);


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
                    Atualize os detalhes da sua conta ou cartão.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="account-type">Tipo</Label>
                    <Select name="account-type" defaultValue={account.type} onValueChange={(v) => setAccountType(v as Account['type'])}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(accountTypeLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label>Logo do Banco</Label>
                    <div className="flex flex-wrap gap-2">
                        {bankLogos.map((logo, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedLogo(logo)}
                                className={cn(
                                    "flex h-12 w-12 items-center justify-center rounded-full border-2 bg-muted p-1 transition-all",
                                    selectedLogo === logo ? 'border-primary ring-2 ring-primary' : 'border-transparent'
                                )}
                            >
                                <Image src={logo} alt={`logo ${index}`} width={32} height={32} className="h-8 w-8 object-contain" />
                            </button>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="account-name">Nome da Conta/Cartão</Label>
                    <Input
                    id="account-name"
                    defaultValue={account.name}
                    placeholder='Ex: Conta Principal'
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bank-name">Instituição</Label>
                    <Input
                    id="bank-name"
                    defaultValue={account.bank}
                    placeholder='Ex: Banco Digital S/A'
                    />
                </div>
                {accountType === 'credit_card' ? (
                     <div className="space-y-2">
                        <Label htmlFor="credit-limit">Limite do Cartão</Label>
                        <Input
                            id="credit-limit"
                            type="number"
                            step="0.01"
                            defaultValue={account.creditLimit}
                            placeholder='R$ 5.000,00'
                        />
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label htmlFor="balance">Saldo Atual</Label>
                        <Input
                            id="balance"
                            type="number"
                            step="0.01"
                            defaultValue={account.balance}
                            placeholder='R$ 1.234,56'
                        />
                    </div>
                )}
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

function DeleteAccountDialog({ accountName }: { accountName: string }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remover</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente a conta{' '}
                        <span className="font-bold text-foreground">{accountName}</span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction>Excluir</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}


export function AccountsManagement() {
    const [open, setOpen] = React.useState(false);
    const [accountType, setAccountType] = React.useState<Account['type'] | ''>('');


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Contas e Cartões</CardTitle>
          <CardDescription>
            Adicione e gerencie suas contas bancárias e cartões de crédito.
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
              <DialogTitle>Adicionar Nova Conta ou Cartão</DialogTitle>
              <DialogDescription>
                Insira os detalhes para começar a organizar.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
               <div className="space-y-2">
                <Label htmlFor="account-type">Tipo</Label>
                 <Select name="account-type" onValueChange={(v) => setAccountType(v as Account['type'])}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                         {Object.entries(accountTypeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>

            {accountType && (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="account-name">Nome da Conta/Cartão</Label>
                        <Input
                        id="account-name"
                        placeholder="Ex: Conta para o dia a dia"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bank-name">Instituição</Label>
                        <Input
                        id="bank-name"
                        placeholder="Ex: Banco Digital"
                        />
                    </div>
                    {accountType === 'credit_card' ? (
                        <div className="space-y-2">
                            <Label htmlFor="credit-limit">Limite do Cartão</Label>
                            <Input
                                id="credit-limit"
                                type="number"
                                step="0.01"
                                placeholder='R$ 5.000,00'
                            />
                        </div>
                    ) : (
                         <div className="space-y-2">
                            <Label htmlFor="balance">Saldo Inicial</Label>
                            <Input
                                id="balance"
                                type="number"
                                step="0.01"
                                placeholder='R$ 1.234,56'
                            />
                        </div>
                    )}
                </>
            )}
            </div>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>
                Salvar
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
                <div className="rounded-full bg-muted p-2 flex items-center justify-center h-10 w-10">
                    {account.type === 'credit_card' ? <CreditCard className="h-5 w-5 text-muted-foreground" /> :
                     account.logoUrl ? (
                         <Image src={account.logoUrl} alt={account.bank} width={28} height={28} className="h-7 w-7 object-contain" />
                    ) : (
                        account.type === 'other' ? <Wallet className="h-5 w-5 text-muted-foreground" /> : <Landmark className="h-5 w-5 text-muted-foreground" />
                    )}
                </div>
                <div>
                  <p className="font-medium">{account.name}</p>
                  <p className="text-xs text-muted-foreground">{account.bank} • {accountTypeLabels[account.type]}</p>
                </div>
              </div>
              <div className='flex gap-2'>
                <EditAccountDialog account={account} />
                <DeleteAccountDialog accountName={account.name} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
