
'use client';

import { createAccount, deleteAccount, updateAccount } from '@/app/(private)/accounts/actions';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { bankLogos } from '@/lib/data';
import type { Account, Vault } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { CreditCard, Edit, Landmark, PlusCircle, Trash2, Wallet } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { AnimatedCounter } from '../ui/animated-counter';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';


const accountTypeLabels: Record<Account['type'], string> = {
    checking: 'Conta Corrente',
    savings: 'Poupança',
    investment: 'Investimento',
    credit_card: 'Cartão de Crédito',
    other: 'Outro',
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function AccountItem({ account, userVaults, currentUserId }: { account: Account, userVaults: Vault[], currentUserId: string }) {
    const isOwner = account.ownerId === currentUserId;
    const canEdit = isOwner;
    const canDelete = isOwner;
    const isCreditCard = account.type === 'credit_card';

    const visibleInArray = React.useMemo(() => {
        if (Array.isArray(account.visibleIn)) {
            return account.visibleIn;
        }
        const visibleIn = account.visibleIn as any;
        if (typeof visibleIn === 'string' && visibleIn.length > 0) {
            return visibleIn.split(',');
        }
        return [];
    }, [account.visibleIn]);

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                ease: "easeOut",
                duration: 0.4,
            },
        },
    };

    return (
        <motion.div 
            variants={itemVariants} 
            className="group relative overflow-hidden rounded-[40px] bg-white/40 backdrop-blur-3xl border border-white/60 p-8 shadow-[0_20px_50px_rgba(45,36,30,0.06)] hover:shadow-[0_30px_70px_rgba(45,36,30,0.12)] transition-all duration-700 hover:-translate-y-2"
        >
            {/* Card Pattern Overlay */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ff6b7b]/5 to-transparent rounded-full -mr-16 -mt-16 blur-2xl" />
            
            <div className="relative z-10 space-y-6">
                {/* Header: Bank & Actions */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-white p-2 shadow-sm border border-[#2D241E]/5 overflow-hidden flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
                            {account.logoUrl ? (
                                <Image src={account.logoUrl} alt={account.bank} width={40} height={40} className="w-full h-full object-contain" />
                            ) : (
                                <Landmark className="h-7 w-7 text-[#2D241E]/10" />
                            )}
                        </div>
                        <div>
                            <h4 className="font-headline text-2xl font-bold text-[#2D241E] leading-tight italic">{account.bank}</h4>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#2D241E]/30 mt-0.5">{accountTypeLabels[account.type]}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 translate-y-1">
                        <EditAccountDialog account={account} disabled={!canEdit} userVaults={userVaults} currentUserId={currentUserId} />
                        <DeleteAccountDialog 
                            account={account} 
                            disabled={!canDelete} 
                            currentUserId={currentUserId}
                        />
                    </div>
                </div>

                {/* Middle: Virtual Card Chip */}
                <div className="flex items-center justify-between py-4">
                    <div className="h-10 w-14 rounded-lg bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600/50 relative overflow-hidden shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),0_2px_10px_rgba(0,0,0,0.1)] group-hover:shadow-[0_4px_20px_rgba(212,175,55,0.3)] transition-all">
                        <div className="absolute inset-0 grid grid-cols-2 gap-px opacity-30">
                            <div className="border-b border-r border-amber-900/20" />
                            <div className="border-b border-amber-900/20" />
                            <div className="border-r border-amber-900/20" />
                            <div className="border-amber-900/20" />
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-4 border border-amber-900/10 rounded-sm" />
                    </div>
                    {isCreditCard ? <CreditCard className="h-8 w-8 text-[#2D241E]/10 group-hover:text-[#ff6b7b]/20 transition-colors" /> : <Wallet className="h-8 w-8 text-[#2D241E]/10 group-hover:text-emerald-500/20 transition-colors" />}
                </div>

                {/* Footer: Balance & Name */}
                <div className="flex items-end justify-between pt-4">
                    <div className="space-y-1.5">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#2D241E]/30 italic">Titular do Cartão</p>
                        <p className="font-bold text-[#2D241E] tracking-tight text-lg group-hover:text-[#ff6b7b] transition-colors">{account.name}</p>
                    </div>

                    <div className="text-right">
                        {isCreditCard ? (
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b7b]/60">Fatura Atual</p>
                                <p className="text-3xl font-headline font-black text-[#ff6b7b] tracking-tighter italic scale-105 origin-right">
                                    <AnimatedCounter value={account.balance} formatter={formatCurrency} />
                                </p>
                                <p className="text-[11px] font-bold text-[#2D241E]/50 italic mt-1">
                                    de {formatCurrency(account.creditLimit || 0)} limite
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500/60">Saldo Disponível</p>
                                <p className={cn("text-3xl font-headline font-black tracking-tighter italic scale-105 origin-right", account.balance >= 0 ? 'text-emerald-500' : 'text-[#ff6b7b]')}>
                                    <AnimatedCounter value={account.balance} formatter={formatCurrency} />
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Visibility Pills */}
            {isOwner && visibleInArray.length > 0 && (
                <div className="mt-8 pt-6 border-t border-[#2D241E]/5 flex items-center gap-3 flex-wrap">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30 italic">Visível em:</span>
                    {visibleInArray.map((vaultId: string) => {
                        const vault = userVaults.find(v => v.id === vaultId);
                        return vault ? (
                            <Badge key={vaultId} className="bg-[#ff6b7b]/10 text-[#ff6b7b] hover:bg-[#ff6b7b]/20 border border-[#ff6b7b]/20 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest shadow-sm">
                                {vault.name}
                            </Badge>
                        ) : null;
                    })}
                </div>
            )}
        </motion.div>
    );
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
    const [isLoading, setIsLoading] = React.useState(false);
    const isOwner = account.ownerId === currentUserId;

    React.useEffect(() => {
        if (open) {
            setSelectedLogo(account.logoUrl);
            setAccountType(account.type);
        }
    }, [account, open]);

    const tooltipContent = "Apenas o proprietário pode editar esta conta.";
    
    const visibleInArray = React.useMemo(() => {
        if (Array.isArray(account.visibleIn)) {
            return account.visibleIn;
        }
        const visibleIn = account.visibleIn as any;
        if (typeof visibleIn === 'string' && visibleIn.length > 0) {
            return visibleIn.split(',');
        }
        return [];
    }, [account.visibleIn]);

    return (
         <Dialog open={open} onOpenChange={setOpen}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 rounded-xl border-[#2D241E]/5 bg-white/50 text-[#2D241E]/40 hover:text-[#ff6b7b] hover:border-[#ff6b7b]/20 hover:bg-white transition-all shadow-sm"
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

            <DialogContent className="bg-[#fdfcf7] border-none rounded-[40px] shadow-2xl overflow-hidden p-0 max-w-lg">
            <DialogHeader className="p-8 pb-4 bg-white/50 backdrop-blur-sm border-b border-[#2D241E]/5">
                <DialogTitle className="text-2xl font-bold font-headline text-[#2D241E] italic">Editar <span className="text-[#ff6b7b]">Conta</span></DialogTitle>
                <DialogDescription className="text-sm font-medium text-[#2D241E]/40 italic">
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
                <input type="hidden" name="logoUrl" value={selectedLogo || ''} />
                <input type="hidden" name="scope" value="personal" />
                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {isOwner && (
                        <div className="space-y-2 rounded-md border p-4">
                            <Label>Visibilidade nos Cofres</Label>
                            <p className='text-xs text-muted-foreground'>Marque em quais cofres esta conta pessoal deve ser visível.</p>
                             {userVaults.map(vault => (
                                 <div key={vault.id} className="flex items-center justify-between">
                                    <Label htmlFor={`visible-${vault.id}`} className="font-normal">{vault.name}</Label>
                                    <Switch 
                                        id={`visible-${vault.id}`} 
                                        name={`visible-${vault.id}`}
                                        defaultChecked={visibleInArray.includes(vault.id)}
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
                                    type="button"
                                    key={index}
                                    onClick={() => setSelectedLogo(logo)}
                                    className={cn(
                                        "flex h-12 w-12 items-center justify-center rounded-full border-2 bg-muted transition-all overflow-hidden",
                                        selectedLogo === logo ? 'border-primary ring-2 ring-primary' : 'border-transparent'
                                    )}
                                >
                                    <Image src={logo} alt={`logo ${index}`} width={48} height={48} className="h-full w-full object-cover rounded-full" />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="account-type" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40 ml-1">Tipo de Conta</Label>
                        <Select name="account-type" value={accountType} onValueChange={(v) => setAccountType(v as Account['type'])}>
                            <SelectTrigger id="account-type" className="h-14 rounded-2xl border-2 border-[#2D241E]/5 bg-white text-lg font-bold text-[#2D241E] transition-all shadow-sm">
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-[#2D241E]/5 shadow-xl">
                                {Object.entries(accountTypeLabels).map(([value, label]) => (
                                    <SelectItem key={value} value={value} className="rounded-xl font-bold text-[#2D241E] focus:bg-[#ff6b7b]/10 focus:text-[#ff6b7b]">{label}</SelectItem>
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
                                inputMode="decimal"
                                step="0.01"
                                defaultValue={account.creditLimit || ''}
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
                                inputMode="decimal"
                                step="0.01"
                                defaultValue={account.balance}
                                placeholder='R$ 1.234,56'
                            />
                        </div>
                    )}
                </div>
            </fieldset>
            <DialogFooter className="p-8 pt-0">
              <Button type="submit" disabled={!isOwner || isLoading} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-gradient-to-br from-[#ff6b7b] to-[#fa8292] text-white shadow-xl shadow-[#ff6b7b]/20 border-none">
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
               {!isOwner && <p className="text-xs text-muted-foreground mt-4 text-center">Apenas o proprietário pode salvar alterações.</p>}
            </DialogFooter>
            </form>
            </DialogContent>
        </Dialog>
    )
}

function DeleteAccountDialog({ account, disabled, currentUserId }: { account: Account, disabled: boolean, currentUserId: string }) {
  const owner = account.ownerId === currentUserId ? { name: 'Você' } : { name: 'outro usuário' };
  const tooltipContent = `Apenas o proprietário (${owner?.name}) pode realizar esta ação.`;

  return (
    <AlertDialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl border-[#2D241E]/5 bg-white/50 text-[#2D241E]/40 hover:text-destructive hover:border-destructive/20 hover:bg-white transition-all shadow-sm"
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

// @ts-expect-error - pendencia estrutural a ser revisada
export function AccountsManagement({ accounts, currentUserId, userVaults, workspaceId, workspaceName, isVaultOwner }: AccountsManagementProps) {
    // @ts-expect-error - pendencia estrutural a ser revisada
    const isPersonalWorkspace = workspaceId === currentUserId;
    
    const [open, setOpen] = React.useState(false);
    const [accountType, setAccountType] = React.useState<Account['type'] | ''>('');
    const [selectedLogo, setSelectedLogo] = React.useState<string | undefined>('');
    const [accountName, setAccountName] = React.useState('');
    const [bankName, setBankName] = React.useState('');
    const [balance, setBalance] = React.useState('');
    const [creditLimit, setCreditLimit] = React.useState('');

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h2 className="font-headline text-3xl font-bold text-[#2D241E] italic">Contas e <span className="text-[#ff6b7b]">Cartões</span></h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2D241E]/30 italic">Gestão de Patrimônio e Limites de Crédito</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-button h-12 px-6 rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#ff6b7b]/20">
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#fdfcf7] border-none rounded-[40px] shadow-2xl overflow-hidden p-0 max-w-lg">
            <DialogHeader className="p-8 pb-4 bg-white/50 backdrop-blur-sm border-b border-[#2D241E]/5">
              <DialogTitle className="text-2xl font-bold font-headline text-[#2D241E] italic">Nova Conta ou Cartão</DialogTitle>
              <DialogDescription className="text-sm font-medium text-[#2D241E]/40 italic">
                A nova conta será sua, mas você poderá torná-la visível em seus cofres.
              </DialogDescription>
            </DialogHeader>
            <form action={async (formData) => {
              if (!accountType || !accountName || !bankName) {
                return;
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
              } catch (error) {
                console.error('Erro ao criar conta:', error);
              }
            }}>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <input type="hidden" name="logoUrl" value={selectedLogo} />
                <input type="hidden" name="scope" value="personal" />
                
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">Instituição</Label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {bankLogos.map((logo, index) => (
                      <button
                        type="button"
                        key={index}
                        onClick={() => setSelectedLogo(logo)}
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-2xl border-2 bg-white transition-all overflow-hidden shadow-sm hover:scale-110",
                          selectedLogo === logo ? 'border-[#ff6b7b] ring-4 ring-[#ff6b7b]/10' : 'border-[#2D241E]/5'
                        )}
                      >
                        <Image src={logo} alt={`logo ${index}`} width={48} height={48} className="h-full w-full object-contain p-1" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="account-type" className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">Tipo de Conta</Label>
                  <Select name="account-type" onValueChange={(v) => setAccountType(v as Account['type'])}>
                    <SelectTrigger id="account-type" className="h-14 rounded-2xl border-2 border-[#2D241E]/5 bg-white text-lg font-bold text-[#2D241E] transition-all shadow-sm">
                      <SelectValue placeholder="Selecione o tipo..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-[#2D241E]/5 shadow-xl">
                      {Object.entries(accountTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value} className="rounded-xl font-bold text-[#2D241E] focus:bg-[#ff6b7b]/10 focus:text-[#ff6b7b]">{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {accountType && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="space-y-3">
                      <Label htmlFor="account-name" className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">Nome de Exibição *</Label>
                      <Input
                        id="account-name"
                        name="account-name"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="Ex: Minha Conta Principal"
                        className="h-14 rounded-2xl border-2 border-[#2D241E]/5 bg-white text-lg font-bold text-[#2D241E] focus:border-[#ff6b7b] focus:ring-0 transition-all shadow-sm"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="bank-name" className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">Nome do Banco *</Label>
                      <Input
                        id="bank-name"
                        name="bank-name"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="Ex: Nubank, Itaú..."
                        className="h-14 rounded-2xl border-2 border-[#2D241E]/5 bg-white text-lg font-bold text-[#2D241E] focus:border-[#ff6b7b] focus:ring-0 transition-all shadow-sm"
                        required
                      />
                    </div>

                    {accountType === 'credit_card' ? (
                      <div className="space-y-3">
                        <Label htmlFor="credit-limit" className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">Limite do Cartão (R$)</Label>
                        <Input
                          id="credit-limit"
                          name="credit-limit"
                          type="text"
                          inputMode="decimal"
                          value={creditLimit}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (val) {
                              setCreditLimit((Number(val)/100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
                            } else setCreditLimit('');
                          }}
                          placeholder='R$ 0,00'
                          className="h-16 rounded-[24px] border-2 border-[#2D241E]/5 bg-white text-center text-2xl font-black text-[#2D241E] focus:border-[#ff6b7b] focus:ring-0 transition-all shadow-inner"
                        />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Label htmlFor="balance" className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">Saldo Atual (R$)</Label>
                        <Input
                          id="balance"
                          name="balance"
                          type="text"
                          inputMode="decimal"
                          value={balance}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (val) {
                              setBalance((Number(val)/100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
                            } else setBalance('');
                          }}
                          placeholder='R$ 0,00'
                          className="h-16 rounded-[24px] border-2 border-[#2D241E]/5 bg-white text-center text-2xl font-black text-[#2D241E] focus:border-[#ff6b7b] focus:ring-0 transition-all shadow-inner"
                        />
                      </div>
                    )}

                    <div className="space-y-4 rounded-[32px] bg-white/40 border-2 border-white p-6 shadow-sm">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">Visibilidade</Label>
                      {userVaults.length > 0 ? (
                        <>
                          <p className='text-[10px] text-muted-foreground italic mb-4'>Marque em quais cofres esta conta pessoal deve ser visível para outros membros.</p>
                          <div className="space-y-3">
                            {userVaults.map(vault => (
                              <div key={vault.id} className="flex items-center justify-between">
                                <Label htmlFor={`create-visible-${vault.id}`} className="font-bold text-[#2D241E]">{vault.name}</Label>
                                <Switch 
                                  id={`create-visible-${vault.id}`} 
                                  name={`visible-${vault.id}`}
                                />
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className='text-[10px] text-muted-foreground italic'>Você ainda não participa de nenhum cofre compartilhado.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
              <DialogFooter className="p-8 pt-0">
                <Button 
                  type="submit" 
                  disabled={!accountType || !accountName || !bankName}
                  className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-gradient-to-br from-[#ff6b7b] to-[#fa8292] text-white shadow-xl shadow-[#ff6b7b]/20 border-none"
                >
                  Salvar Conta
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {accounts.map((account) => (
          <AccountItem 
            key={account.id} 
            account={account} 
            userVaults={userVaults} 
            currentUserId={currentUserId}
          />
        ))}
        {accounts.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center space-y-4 bg-white/20 backdrop-blur-sm rounded-[40px] border-2 border-dashed border-[#2D241E]/5">
            <div className="p-4 rounded-3xl bg-white shadow-sm border border-[#2D241E]/5">
              <Landmark className="h-10 w-10 text-[#2D241E]/10" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-[#2D241E]">Oops!</p>
              <p className="text-sm text-muted-foreground italic">Nenhuma conta ou cartão cadastrado ainda.</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
