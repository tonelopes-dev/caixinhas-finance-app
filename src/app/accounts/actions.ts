

'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AccountService } from '@/services/account.service';
import { VaultService } from '@/services/vault.service';
import { AuthService } from '@/services/auth.service';
import { CategoryService } from '@/services/category.service';
import { revalidatePath } from 'next/cache';
import type { Account } from '@/lib/definitions';
import { z } from 'zod';

interface AccountsData {
  accounts: Account[];
  currentUser: any;
  userVaults: any[];
  categories: any[];
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

  // E as categorias do usuário
  const categories = await CategoryService.getUserCategories(userId);

  return {
    accounts: accounts as Account[],
    currentUser,
    userVaults,
    categories,
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


// --- CATEGORY ACTIONS ---

const categorySchema = z.object({
  name: z.string().min(1, 'O nome da categoria é obrigatório.'),
});

export type CategoryActionState = {
  message?: string;
  errors?: {
    name?: string[];
  };
  success?: boolean;
};

export async function createCategory(prevState: CategoryActionState, formData: FormData): Promise<CategoryActionState> {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) {
    return { success: false, message: 'Usuário não autenticado' };
  }
  
  const validatedFields = categorySchema.safeParse({ name: formData.get('name') });
  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await CategoryService.createCategory(validatedFields.data.name, session.user.id);
    revalidatePath('/accounts');
    return { success: true, message: 'Categoria criada com sucesso!' };
  } catch (error) {
    return { success: false, message: 'Erro ao criar categoria.' };
  }
}

export async function updateCategory(prevState: CategoryActionState, formData: FormData): Promise<CategoryActionState> {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) {
    return { success: false, message: 'Usuário não autenticado' };
  }

  const id = formData.get('id') as string;
  const validatedFields = categorySchema.safeParse({ name: formData.get('name') });
  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await CategoryService.updateCategory(id, validatedFields.data.name, session.user.id);
    revalidatePath('/accounts');
    return { success: true, message: 'Categoria atualizada!' };
  } catch (error) {
    return { success: false, message: 'Erro ao atualizar categoria.' };
  }
}

export async function deleteCategory(prevState: CategoryActionState, formData: FormData): Promise<CategoryActionState> {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) {
    return { success: false, message: 'Usuário não autenticado' };
  }

  const id = formData.get('id') as string;

  try {
    await CategoryService.deleteCategory(id, session.user.id);
    revalidatePath('/accounts');
    return { success: true, message: 'Categoria excluída!' };
  } catch (error) {
    return { success: false, message: 'Erro ao excluir categoria.' };
  }
}

