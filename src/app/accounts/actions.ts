
'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AccountService } from '@/services/account.service';
import { VaultService } from '@/services/vault.service';
import { AuthService } from '@/services/auth.service';
import { revalidatePath } from 'next/cache';
import type { Account } from '@/lib/definitions';

async function getUserIdFromSession(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}


interface AccountsData {
  accounts: Account[];
  currentUser: any;
  userVaults: any[];
}

export async function getAccountsData(userId: string): Promise<AccountsData> {
  const currentUser = await AuthService.getUserById(userId);
  if (!currentUser) {
    throw new Error('Usuário não encontrado');
  }

  // Com a nova lógica, sempre buscamos todas as contas do usuário
  const accounts = await AccountService.getUserAccounts(userId);

  // E todos os cofres dos quais ele participa, para a lógica de visibilidade
  const userVaults = await VaultService.getUserVaults(userId);

  return {
    accounts: accounts as Account[],
    currentUser,
    userVaults,
  };
}

export async function createAccount(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  
  if (!userId) {
    throw new Error('Usuário não autenticado');
  }

  const accountType = formData.get('account-type') as Account['type'];
  const name = formData.get('account-name') as string;
  const bank = formData.get('bank-name') as string;
  const logoUrl = formData.get('logoUrl') as string;
  const balance = parseFloat(formData.get('balance') as string) || 0;
  const creditLimit = parseFloat(formData.get('credit-limit') as string) || 0;
  
  if (!name?.trim() || !bank?.trim() || !accountType) {
    throw new Error('Nome da conta, banco e tipo são obrigatórios');
  }

  // Processa visibilidade nos vaults
  const visibleIn: string[] = [];
  const userVaults = await VaultService.getUserVaults(userId);
  userVaults.forEach((vault: any) => {
    if (formData.get(`visible-${vault.id}`) === 'on') {
      visibleIn.push(vault.id);
    }
  });

  const accountData = {
    name,
    bank,
    type: accountType,
    balance: accountType === 'credit_card' ? 0 : balance,
    creditLimit: accountType === 'credit_card' ? creditLimit : 0,
    logoUrl,
    ownerId: userId,
    scope: 'personal', // Agora sempre pessoal
    visibleIn,
    allowFullAccess: false, // Simplificado: removido
  };

  await AccountService.createAccount(accountData as any);
  
  revalidatePath('/accounts');
  revalidatePath('/dashboard');
  revalidatePath('/', 'layout');
}

export async function updateAccount(accountId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('Usuário não autenticado');
  }

  const account = await AccountService.getAccountById(accountId);
  if (!account || account.ownerId !== userId) {
    throw new Error('Sem permissão para editar esta conta');
  }

  const name = formData.get('account-name') as string;
  const bank = formData.get('bank-name') as string;
  const logoUrl = formData.get('logoUrl') as string;
  const balance = parseFloat(formData.get('balance') as string) || 0;
  const creditLimit = parseFloat(formData.get('credit-limit') as string) || 0;

  if (!name?.trim() || !bank?.trim()) {
    throw new Error('Nome da conta e banco são obrigatórios');
  }

  const visibleIn: string[] = [];
  const userVaults = await VaultService.getUserVaults(userId);
  userVaults.forEach((vault: any) => {
    if (formData.get(`visible-${vault.id}`) === 'on') {
      visibleIn.push(vault.id);
    }
  });

  const updateData = {
    name,
    bank,
    logoUrl,
    balance: account.type === 'credit_card' ? account.balance : balance,
    creditLimit: account.type === 'credit_card' ? creditLimit : account.creditLimit,
    visibleIn,
  };

  await AccountService.updateAccount(accountId, updateData as any);
  
  revalidatePath('/accounts');
  revalidatePath('/dashboard');
  revalidatePath('/', 'layout');
}

export async function deleteAccount(accountId: string) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('Usuário não autenticado');
  }

  const account = await AccountService.getAccountById(accountId);
  if (!account || account.ownerId !== userId) {
    throw new Error('Sem permissão para excluir esta conta');
  }

  await AccountService.deleteAccount(accountId);
  
  revalidatePath('/accounts');
  revalidatePath('/dashboard');
  revalidatePath('/', 'layout');
}
