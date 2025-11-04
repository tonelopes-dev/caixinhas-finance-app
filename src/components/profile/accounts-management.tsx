
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
import { accounts as allAccounts, bankLogos, vaults, getMockDataForUser } from '@/lib/data';
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
import type { Account } from '@/lib/definitions';
import { cn } from '@/lib/utils';


const accountTypeLabels: Record<Account['type'], string> = {
    checking: 'Conta Corrente',
    savings: 'Poupança',
    investment: 'Investimento',
    credit_card: 'Cartão de Crédito',
    other: 'Outro',
}

function EditAccountDialog({ account, disabled }: { account: Account, disabled: boolean }) {
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
                 {disabled && <p className="text-xs text-muted-foreground">Apenas o proprietário do cofre pode editar contas.</p>}
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

export function AccountsManagement() {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [accountType, setAccountType] = React.useState<Account['type'] | ''>('');
    const [selectedLogo, setSelectedLogo] = React.useState<string | undefined>();
    
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);
    const [workspaceName, setWorkspaceName] = useState<string>('');
    const [isOwner, setIsOwner] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);


    useEffect(() => {
        const userId = localStorage.getItem('DREAMVAULT_USER_ID');
        const selectedWorkspaceId = sessionStorage.getItem('DREAMVAULT_VAULT_ID');

        if (!userId || !selectedWorkspaceId) {
            router.push('/login');
            return;
        }

        setCurrentUserId(userId);
        setWorkspaceId(selectedWorkspaceId);

        const isPersonal = selectedWorkspaceId === userId;
        setAccounts(allAccounts.filter(a => a.ownerId === selectedWorkspaceId));
        
        if (isPersonal) {
            setWorkspaceName('Sua Conta Pessoal');
            setIsOwner(true);
        } else {
            const vault = vaults.find(v => v.id === selectedWorkspaceId);
            if (vault) {
                setWorkspaceName(vault.name);
                setIsOwner(vault.ownerId === userId);
            }
        }
    }, [router]);

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
            <Button variant="outline" size="sm" disabled={!isOwner}>
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
            const canEdit = isOwner;
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
                    <p className="font-medium">{account.name}</p>
                    <p className="text-xs text-muted-foreground">{account.bank} • {accountTypeLabels[account.type]}</p>
                    </div>
                </div>
                <div className='flex gap-2 items-center'>
                    {!canEdit && <Lock className="h-4 w-4 text-muted-foreground" title="Apenas o proprietário do cofre pode gerenciar contas." />}
                    <EditAccountDialog account={account} disabled={!canEdit} />
                    <DeleteAccountDialog accountName={account.name} disabled={!canEdit} />
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
