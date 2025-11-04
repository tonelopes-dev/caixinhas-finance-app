
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { bankLogos, users } from '@/lib/data';
import { Landmark, PlusCircle, Trash2, Edit, CreditCard, Wallet, Lock } from 'lucide-react';
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
import type { Account, Vault } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Switch } from '../ui/switch';
import { Badge } from '@/components/ui/badge';


const accountTypeLabels: Record<Account['type'], string> = {
    checking: 'Conta Corrente',
    savings: 'Poupança',
    investment: 'Investimento',
    credit_card: 'Cartão de Crédito',
    other: 'Outro',
}

interface AccountsManagementProps {
  accounts: Account[];
  currentUserId: string;
  userVaults: Vault[];
  workspaceId: string;
  workspaceName: string;
  isVaultOwner: boolean;
}

function EditAccountDialog({ account, disabled, userVaults, currentUserId }: { account: Account, disabled: boolean, userVaults: any[], currentUserId: string | null }) {
    const [open, setOpen] = React.useState(false);
    const [selectedLogo, setSelectedLogo] = React.useState(account.logoUrl);
    const [accountType, setAccountType] = React.useState<Account['type']>(account.type);
    const [isPersonal, setIsPersonal] = React.useState(account.scope === 'personal');

    return (
         <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary"
                    disabled={disabled}
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
            <fieldset disabled={disabled}>
                <div className="grid gap-4 py-4">
                     <div className="space-y-2">
                        <Label>Tipo de Conta</Label>
                        <Select name="scope" defaultValue={account.scope} onValueChange={(v) => setIsPersonal(v === 'personal')}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pessoal ou Conjunta?" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="personal">Pessoal</SelectItem>
                                {userVaults.map(vault => (
                                     <SelectItem key={vault.id} value={vault.id}>Conjunta: {vault.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {isPersonal && (
                        <div className="space-y-2 rounded-md border p-4">
                            <Label>Visibilidade nos Cofres</Label>
                            <p className='text-xs text-muted-foreground'>Marque em quais cofres esta conta pessoal deve ser visível.</p>
                             {userVaults.map(vault => (
                                 <div key={vault.id} className="flex items-center justify-between">
                                    <Label htmlFor={`visible-${vault.id}`} className="font-normal">{vault.name}</Label>
                                    <Switch id={`visible-${vault.id}`} defaultChecked={account.visibleIn?.includes(vault.id)} />
                                 </div>
                             ))}
                        </div>
                    )}


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
            </fieldset>
            <DialogFooter>
                <Button onClick={() => setOpen(false)} disabled={disabled}>
                    Salvar Alterações
                </Button>
                 {disabled && <p className="text-xs text-muted-foreground">Apenas membros do cofre podem editar contas.</p>}
            </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function DeleteAccountDialog({ accountName, disabled }: { accountName: string, disabled: boolean }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    disabled={disabled}
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

export function AccountsManagement({ accounts, currentUserId, userVaults, workspaceId, workspaceName, isVaultOwner }: AccountsManagementProps) {
    const [open, setOpen] = React.useState(false);
    const [accountType, setAccountType] = React.useState<Account['type'] | ''>('');
    const [selectedLogo, setSelectedLogo] = React.useState<string | undefined>();
    const isPersonalWorkspace = workspaceId === currentUserId;


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Contas e Cartões</CardTitle>
          <CardDescription>
            Gerencie as fontes de dinheiro para <span className='font-bold text-primary'>{workspaceName}</span>.
          </CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={!isVaultOwner}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Conta ou Cartão</DialogTitle>
              <DialogDescription>
                A nova conta será adicionada ao espaço <span className='font-bold text-primary'>{workspaceName}</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
          {accounts.map((account) => {
            const isOwner = account.ownerId === currentUserId;
            // Can edit if it's a personal account (in personal space) OR a joint account in a vault.
            const canEdit = isPersonalWorkspace || account.scope === workspaceId;
            const canDelete = isOwner; // Only the owner can delete.

            const isLocked = !isOwner;
            const owner = users.find(u => u.id === account.ownerId);

            return (
                <div
                key={account.id}
                className="flex items-center justify-between rounded-lg border p-3"
                >
                <div className="flex items-center gap-4">
                    <div className="rounded-full bg-muted p-2 flex items-center justify-center h-10 w-10">
                        {account.logoUrl ? (
                             <Image src={account.logoUrl} alt={account.bank} width={28} height={28} className="h-7 w-7 object-contain" />
                        ) : (
                            account.type === 'credit_card' ? <CreditCard className="h-5 w-5 text-muted-foreground" /> : <Landmark className="h-5 w-5 text-muted-foreground" />
                        )}
                    </div>
                    <div>
                        <div className='flex items-center gap-2'>
                           <p className="font-medium">{account.name}</p>
                           {account.scope === 'personal' && <Badge variant="secondary">Pessoal</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{account.bank} • {accountTypeLabels[account.type]}</p>
                    </div>
                </div>
                <div className='flex gap-1 items-center'>
                    {isLocked && (
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Apenas o proprietário ({owner?.name}) pode excluir.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    <EditAccountDialog account={account} disabled={!canEdit} userVaults={userVaults} currentUserId={currentUserId} />
                    <DeleteAccountDialog accountName={account.name} disabled={!canDelete} />
                </div>
                </div>
            )
          })}
           {accounts.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma conta ou cartão cadastrado neste espaço.</p>
           )}
        </div>
      </CardContent>
    </Card>
  );
}
