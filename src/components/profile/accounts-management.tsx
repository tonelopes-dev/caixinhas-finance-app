
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createAccount, updateAccount, deleteAccount } from '@/app/accounts/actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { bankLogos, users } from '@/lib/data';
import { Landmark, PlusCircle, Trash2, Edit, CreditCard, Wallet, Lock, AlertCircle } from 'lucide-react';
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
    const [scopeValue, setScopeValue] = React.useState(account.scope === 'personal' ? 'personal' : (account as any).vaultId || '');
    const [isPersonal, setIsPersonal] = React.useState(account.scope === 'personal');
    const [allowFullAccess, setAllowFullAccess] = React.useState((account as any).allowFullAccess || false);
    const [isLoading, setIsLoading] = React.useState(false);
    const isOwner = account.ownerId === currentUserId;

    // Reset values when account changes or dialog opens
    React.useEffect(() => {

        setSelectedLogo(account.logoUrl);
        setAccountType(account.type);
        setScopeValue(account.scope === 'personal' ? 'personal' : (account as any).vaultId || '');
        setIsPersonal(account.scope === 'personal');
        setAllowFullAccess((account as any).allowFullAccess || false);
    }, [account.logoUrl, account.type, account.scope, (account as any).vaultId, (account as any).allowFullAccess, open]);

    const tooltipContent = "Você não tem permissão para editar esta conta.";

    return (
         <Dialog open={open} onOpenChange={setOpen}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
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
                    </TooltipTrigger>
                    {disabled && (
                        <TooltipContent>
                            <p>{tooltipContent}</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>

            <DialogContent>
            <DialogHeader>
                <DialogTitle>Editar Conta</DialogTitle>
                <DialogDescription>
                    Atualize os detalhes da sua conta ou cartão.
                </DialogDescription>
            </DialogHeader>
            <form action={async (formData) => {
                try {
                    setIsLoading(true);
                    await updateAccount(account.id, formData);
                    setOpen(false);
                } catch (error) {
                    console.error('Erro ao atualizar conta:', error);
                } finally {
                    setIsLoading(false);
                }
            }}>
            <fieldset disabled={!isOwner}>
                <input type="hidden" name="logoUrl" value={selectedLogo} />
                <div className="grid gap-4 py-4">
                     <div className="space-y-2">
                        <Label>Tipo de Conta</Label>
                        <Select name="scope" value={scopeValue} onValueChange={(v) => {
                            setScopeValue(v);
                            setIsPersonal(v === 'personal');
                        }}>
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
                                    <Switch 
                                        id={`visible-${vault.id}`} 
                                        name={`visible-${vault.id}`}
                                        defaultChecked={account.visibleIn?.includes(vault.id)} 
                                    />
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
                        <Select name="account-type" value={accountType} onValueChange={(v) => setAccountType(v as Account['type'])}>
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
                        name="account-name"
                        defaultValue={account.name}
                        placeholder='Ex: Conta Principal'
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bank-name">Instituição</Label>
                        <Input
                        id="bank-name"
                        name="bank-name"
                        defaultValue={account.bank}
                        placeholder='Ex: Banco Digital S/A'
                        />
                    </div>
                    {accountType === 'credit_card' ? (
                         <div className="space-y-2">
                            <Label htmlFor="credit-limit">Limite do Cartão</Label>
                            <Input
                                id="credit-limit"
                                name="credit-limit"
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
                                name="balance"
                                type="number"
                                step="0.01"
                                defaultValue={account.balance}
                                placeholder='R$ 1.234,56'
                            />
                        </div>
                    )}

                    {/* Full Access Switch - Only for account owner and non-personal accounts */}
                    {isOwner && scopeValue !== 'personal' && (
                         <div className="flex items-center justify-between space-x-2 rounded-lg border p-4 bg-amber-500/10 border-amber-500/20">
                            <Label htmlFor="full-access" className="flex flex-col space-y-1">
                                <span className="font-medium flex items-center gap-2"><AlertCircle className="h-4 w-4 text-amber-600" /> Acesso Total dos Membros</span>
                                <span className="text-xs font-normal leading-snug text-muted-foreground">
                                    Permitir que todos os membros do cofre editem e excluam esta conta.
                                </span>
                            </Label>
                            <>
                                <input type="hidden" name="allowFullAccessValue" value={allowFullAccess.toString()} />
                                <Switch 
                                    id="full-access" 
                                    name="allowFullAccess" 
                                    checked={allowFullAccess}
                                    disabled={isLoading}
                                    onCheckedChange={setAllowFullAccess}
                                />
                            </>
                        </div>
                    )}
                </div>
            </fieldset>
            <DialogFooter>
              <Button type="submit" disabled={!isOwner || isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
               {!isOwner && <p className="text-xs text-muted-foreground">Apenas o proprietário pode salvar alterações.</p>}
            </DialogFooter>
            </form>
            </DialogContent>
        </Dialog>
    )
}

function DeleteAccountDialog({ account, disabled }: { account: Account, disabled: boolean }) {
  const owner = users.find(u => u.id === account.ownerId);
  const tooltipContent = `Apenas o proprietário (${owner?.name.split(' ')[0]}) ou alguém com acesso total pode realizar esta ação.`;

  return (
    <AlertDialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          {disabled && (
            <TooltipContent>
              <p>{tooltipContent}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente a conta{' '}
            <span className="font-bold text-foreground">{account.name}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <form action={async () => {
            await deleteAccount(account.id);
          }}>
            <AlertDialogAction type="submit" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function AccountsManagement({ accounts, currentUserId, userVaults, workspaceId, workspaceName, isVaultOwner }: AccountsManagementProps) {
    const isPersonalWorkspace = workspaceId === currentUserId;
    
    const [open, setOpen] = React.useState(false);
    const [accountType, setAccountType] = React.useState<Account['type'] | ''>('');
    const [selectedLogo, setSelectedLogo] = React.useState<string | undefined>('');
    const [accountName, setAccountName] = React.useState('');
    const [bankName, setBankName] = React.useState('');
    const [balance, setBalance] = React.useState('');
    const [creditLimit, setCreditLimit] = React.useState('');
    const [allowFullAccess, setAllowFullAccess] = React.useState(false);
    const [createScopeValue, setCreateScopeValue] = React.useState(isPersonalWorkspace ? 'personal' : workspaceId);
    const [createIsPersonal, setCreateIsPersonal] = React.useState(isPersonalWorkspace);


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
            <Button variant="outline" size="sm" disabled={!isVaultOwner && !isPersonalWorkspace}>
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
            <form action={async (formData) => {
              if (!accountType || !accountName || !bankName) {
                return; // Previne envio se campos obrigatórios estão vazios
              }
              
              try {
                await createAccount(formData);
                setOpen(false);
                setAccountType('');
                setSelectedLogo('');
                setAccountName('');
                setBankName('');
                setBalance('');
                setCreditLimit('');
                setAllowFullAccess(false);
                setCreateScopeValue(isPersonalWorkspace ? 'personal' : workspaceId);
                setCreateIsPersonal(isPersonalWorkspace);
              } catch (error) {
                console.error('Erro ao criar conta:', error);
                // Aqui você poderia mostrar uma notificação de erro
              }
            }}>
            <input type="hidden" name="logoUrl" value={selectedLogo} />
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

              <div className="space-y-2">
                <Label>Tipo de Conta</Label>
                <Select name="scope" value={createScopeValue} onValueChange={(v) => {
                    setCreateScopeValue(v);
                    setCreateIsPersonal(v === 'personal');
                }}>
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

            {accountType && (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="account-name">Nome da Conta/Cartão *</Label>
                        <Input
                        id="account-name"
                        name="account-name"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="Ex: Conta para o dia a dia"
                        required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bank-name">Instituição *</Label>
                        <Input
                        id="bank-name"
                        name="bank-name"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="Ex: Banco Digital"
                        required
                        />
                    </div>
                    {accountType === 'credit_card' ? (
                        <div className="space-y-2">
                            <Label htmlFor="credit-limit">Limite do Cartão</Label>
                            <Input
                                id="credit-limit"
                                name="credit-limit"
                                type="number"
                                step="0.01"
                                value={creditLimit}
                                onChange={(e) => setCreditLimit(e.target.value)}
                                placeholder='R$ 5.000,00'
                            />
                        </div>
                    ) : (
                         <div className="space-y-2">
                            <Label htmlFor="balance">Saldo Inicial</Label>
                            <Input
                                id="balance"
                                name="balance"
                                type="number"
                                step="0.01"
                                value={balance}
                                onChange={(e) => setBalance(e.target.value)}
                                placeholder='R$ 1.234,56'
                            />
                        </div>
                    )}

                    {createIsPersonal && (
                        <div className="space-y-2 rounded-md border p-4">
                            <Label>Visibilidade nos Cofres</Label>
                            <p className='text-xs text-muted-foreground'>Marque em quais cofres esta conta pessoal deve ser visível.</p>
                             {userVaults.map(vault => (
                                 <div key={vault.id} className="flex items-center justify-between">
                                    <Label htmlFor={`create-visible-${vault.id}`} className="font-normal">{vault.name}</Label>
                                    <Switch 
                                        id={`create-visible-${vault.id}`} 
                                        name={`visible-${vault.id}`}
                                    />
                                 </div>
                             ))}
                        </div>
                    )}

                    {/* Full Access Switch - Only for vault accounts */}
                    {!createIsPersonal && (
                         <div className="flex items-center justify-between space-x-2 rounded-lg border p-4 bg-amber-500/10 border-amber-500/20">
                            <Label htmlFor="create-full-access" className="flex flex-col space-y-1">
                                <span className="font-medium flex items-center gap-2"><AlertCircle className="h-4 w-4 text-amber-600" /> Acesso Total dos Membros</span>
                                <span className="text-xs font-normal leading-snug text-muted-foreground">
                                    Permitir que todos os membros do cofre editem e excluam esta conta.
                                </span>
                            </Label>
                            <>
                                <input type="hidden" name="allowFullAccessValue" value={allowFullAccess.toString()} />
                                <Switch 
                                    id="create-full-access" 
                                    name="allowFullAccess" 
                                    checked={allowFullAccess}
                                    onCheckedChange={setAllowFullAccess}
                                />
                            </>
                        </div>
                    )}
                </>
            )}
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={!accountType || !accountName || !bankName}
              >
                Salvar
              </Button>
            </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accounts.map((account) => {
            const isOwner = account.ownerId === currentUserId;
            const canEdit = isOwner || !!account.allowFullAccess;
            const canDelete = isOwner || !!account.allowFullAccess;
            

            
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
                           {account.scope === 'personal' ? (
                               <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="secondary" className="cursor-default">
                                      <Lock className="mr-1 h-3 w-3" />
                                      Pessoal
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Esta é uma conta pessoal visível neste cofre.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                           ) : (
                                <Badge>Compartilhada</Badge>
                           )}
                        </div>
                        <p className="text-xs text-muted-foreground">{account.bank} • {accountTypeLabels[account.type]}</p>
                    </div>
                </div>
                <div className='flex gap-1 items-center'>
                    <EditAccountDialog account={account} disabled={!canEdit} userVaults={userVaults} currentUserId={currentUserId} />
                    <DeleteAccountDialog 
                        account={account} 
                        disabled={!canDelete} 
                    />
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
