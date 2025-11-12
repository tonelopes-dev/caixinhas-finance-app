'use server';

import { cookies } from 'next/headers';
import { AccountService } from '@/services/account.service';
import { VaultService } from '@/services/vault.service';
import { AuthService } from '@/services/auth.service';
import { revalidatePath } from 'next/cache';
import type { Account } from '@/lib/definitions';

interface AccountsData {
  accounts: Account[];
  currentUser: any;
  userVaults: any[];
  workspaceId: string;
  workspaceName: string;
  isVaultOwner: boolean;
}

export async function getAccountsData(userId: string): Promise<AccountsData> {
  const cookieStore = await cookies();
  const vaultId = cookieStore.get('CAIXINHAS_VAULT_ID')?.value;
  
  // Busca o usuário atual
  const currentUser = await AuthService.getUserById(userId);
  if (!currentUser) {
    throw new Error('Usuário não encontrado');
  }

  // Busca todos os vaults do usuário
  const userVaults = await VaultService.getUserVaults(userId);

  let accounts: Account[] = [];
  let workspaceName = '';
  let isVaultOwner = false;

  if (!vaultId || vaultId === userId) {
    // Contexto pessoal - usar getVisibleAccounts com userId
    accounts = await AccountService.getVisibleAccounts(userId, userId) as Account[];
    workspaceName = 'sua conta pessoal';
    isVaultOwner = true;
  } else {
    // Contexto de vault - usar getVisibleAccounts com vaultId
    const vault = await VaultService.getVaultById(vaultId);
    if (!vault) {
      throw new Error('Vault não encontrado');
    }
    
    // Verifica se o usuário é membro do vault
    const isMember = await VaultService.isMember(vaultId, userId);
    if (!isMember) {
      throw new Error('Usuário não é membro deste vault');
    }

    accounts = await AccountService.getVisibleAccounts(userId, vaultId) as Account[];
    workspaceName = `cofre "${vault.name}"`;
    isVaultOwner = vault.ownerId === userId;
  }



  return {
    accounts,
    currentUser,
    userVaults,
    workspaceId: vaultId || userId,
    workspaceName,
    isVaultOwner
  };
}

export async function createAccount(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('CAIXINHAS_USER_ID')?.value;
  const vaultId = cookieStore.get('CAIXINHAS_VAULT_ID')?.value;

  if (!userId) {
    throw new Error('Usuário não autenticado');
  }

  const accountType = formData.get('account-type') as Account['type'];
  const name = formData.get('account-name') as string;
  const bank = formData.get('bank-name') as string;
  const logoUrl = formData.get('logoUrl') as string;
  const balance = parseFloat(formData.get('balance') as string) || 0;
  const creditLimit = parseFloat(formData.get('credit-limit') as string) || 0;
  const scope = formData.get('scope') as string;
  // Usar o valor hidden que sempre será enviado, ao invés de depender do checkbox
  const allowFullAccessValue = formData.get('allowFullAccessValue') as string;
  const allowFullAccess = allowFullAccessValue === 'true';

  // Log para debug
  console.log('FormData recebido:', {
    accountType,
    name,
    bank,
    logoUrl,
    balance,
    creditLimit,
    scope,
    allowFullAccess
  });

  // Validação server-side (redundante com validação client-side)
  if (!name?.trim() || !bank?.trim() || !accountType) {
    throw new Error('Nome da conta, banco e tipo são obrigatórios');
  }

  // Processa visibilidade nos vaults (para contas pessoais)
  const visibleIn: string[] = [];
  if (scope === 'personal') {
    const userVaults = await VaultService.getUserVaults(userId);
    userVaults.forEach((vault: any) => {
      if (formData.get(`visible-${vault.id}`) === 'on') {
        visibleIn.push(vault.id);
      }
    });
  }

  const accountData = {
    name,
    bank,
    type: accountType,
    balance: accountType === 'credit_card' ? 0 : balance,
    creditLimit: accountType === 'credit_card' ? creditLimit : 0,
    logoUrl,
    ownerId: userId,
    scope: scope === 'personal' ? 'personal' : 'shared',
    visibleIn,
    allowFullAccess: scope === 'personal' ? false : allowFullAccess,
    vaultId: scope === 'personal' ? null : scope
  };

  await AccountService.createAccount(accountData as any);
  
  revalidatePath('/accounts');
}

export async function updateAccount(accountId: string, formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('CAIXINHAS_USER_ID')?.value;

  if (!userId) {
    throw new Error('Usuário não autenticado');
  }

  // Busca a conta para verificar permissões
  const account = await AccountService.getAccountById(accountId);
  if (!account) {
    throw new Error('Conta não encontrada');
  }

  const canEdit = account.ownerId === userId || account.allowFullAccess;
  if (!canEdit) {
    throw new Error('Sem permissão para editar esta conta');
  }

  const name = formData.get('account-name') as string;
  const bank = formData.get('bank-name') as string;
  const logoUrl = formData.get('logoUrl') as string;
  const balance = parseFloat(formData.get('balance') as string) || 0;
  const creditLimit = parseFloat(formData.get('credit-limit') as string) || 0;
  const scope = formData.get('scope') as string;
  // Usar o valor hidden que sempre será enviado, ao invés de depender do checkbox
  const allowFullAccessValue = formData.get('allowFullAccessValue') as string;
  const allowFullAccess = allowFullAccessValue === 'true';



  // Validação server-side
  if (!name?.trim() || !bank?.trim()) {
    throw new Error('Nome da conta e banco são obrigatórios');
  }

  // Processa visibilidade nos vaults (para contas pessoais)
  const visibleIn: string[] = [];
  if (scope === 'personal') {
    const userVaults = await VaultService.getUserVaults(userId);
    userVaults.forEach((vault: any) => {
      if (formData.get(`visible-${vault.id}`) === 'on') {
        visibleIn.push(vault.id);
      }
    });
  }

  const updateData = {
    name,
    bank,
    logoUrl,
    balance: account.type === 'credit_card' ? account.balance : balance,
    creditLimit: account.type === 'credit_card' ? creditLimit : account.creditLimit,
    scope: scope === 'personal' ? 'personal' : 'shared',
    visibleIn,
    allowFullAccess: scope === 'personal' ? false : allowFullAccess, // Reset allowFullAccess for personal accounts
    vaultId: scope === 'personal' ? null : scope
  };



  const result = await AccountService.updateAccount(accountId, updateData as any);
  
  // Revalidar múltiplos caminhos para garantir que o cache seja limpo
  revalidatePath('/accounts');
  revalidatePath('/dashboard');
  revalidatePath('/', 'layout');
}

export async function deleteAccount(accountId: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('CAIXINHAS_USER_ID')?.value;

  if (!userId) {
    throw new Error('Usuário não autenticado');
  }

  // Busca a conta para verificar permissões
  const account = await AccountService.getAccountById(accountId);
  if (!account) {
    throw new Error('Conta não encontrada');
  }

  const canDelete = account.ownerId === userId || account.allowFullAccess;
  if (!canDelete) {
    throw new Error('Sem permissão para excluir esta conta');
  }

  await AccountService.deleteAccount(accountId);
  
  revalidatePath('/accounts');
}