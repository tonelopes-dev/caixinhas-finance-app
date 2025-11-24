
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { GoalService } from '@/services/goal.service';
import { VaultService } from '@/services/vault.service';
import { AccountService } from '@/services/account.service';
import { TransactionService } from '@/services/transaction.service';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import type { Goal, Vault, Account, Transaction, User } from '@/lib/definitions';

// --- TIPOS DE ESTADO PARA ACTIONS ---
export type GoalActionState = {
  message?: string | null;
  errors?: {
    name?: string[];
    emoji?: string[];
    targetAmount?: string[];
    visibility?: string[];
    ownerId?: string[];
    ownerType?: string[];
  };
  success?: boolean;
};


// --- VALIDAÇÃO ---
const goalSchema = z.object({
  name: z.string().min(1, 'O nome da caixinha é obrigatório.'),
  emoji: z.string().min(1, 'O emoji é obrigatório.'),
  targetAmount: z.coerce.number().positive('O valor alvo deve ser positivo.'),
  visibility: z.enum(['private', 'shared'], {
    errorMap: () => ({ message: 'Visibilidade inválida.' }),
  }),
  ownerType: z.enum(['user', 'vault'], {
    errorMap: () => ({ message: 'Tipo de proprietário inválido.' }),
  }),
  ownerId: z.string().min(1, 'O proprietário é obrigatório.'),
});


// --- ACTIONS ---

export async function createGoalAction(prevState: GoalActionState, formData: FormData): Promise<GoalActionState> {
  console.log('🎯 createGoalAction - Iniciando...');
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error('❌ createGoalAction - Usuário não autenticado.');
    return { success: false, message: 'Usuário não autenticado' };
  }

  const rawFormData = Object.fromEntries(formData.entries());

  const validatedFields = goalSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    console.log('❌ createGoalAction - Validação falhou:', validatedFields.error.flatten().fieldErrors);
    return { success: false, errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    console.log('✅ createGoalAction - Dados validados. Criando meta...');
    await GoalService.createGoal(validatedFields.data);
    console.log('✅ createGoalAction - Meta criada com sucesso.');
  } catch (error) {
    console.error('❌ createGoalAction - Erro ao criar meta:', error);
    return { success: false, message: 'Ocorreu um erro ao criar a caixinha.' };
  }

  revalidatePath('/goals');
  revalidatePath('/dashboard');
  redirect('/goals');
}


export async function getGoalsPageData(userId: string) {
  console.log(`🔍 getGoalsPageData - Iniciando busca para userId: ${userId}`);
  try {
    const userVaults = await VaultService.getUserVaults(userId);
    console.log(`  - Encontrados ${userVaults.length} cofres para o usuário.`);

    const personalGoalsPromise = GoalService.getGoals(userId, 'user');
    const vaultGoalsPromises = userVaults.map(vault => GoalService.getGoals(vault.id, 'vault'));

    const [personalGoals, ...vaultGoalsArrays] = await Promise.all([
      personalGoalsPromise,
      ...vaultGoalsPromises,
    ]);
    console.log(`  - Encontradas ${personalGoals.length} metas pessoais.`);
    
    const allVaultGoals = vaultGoalsArrays.flat();
    console.log(`  - Total de metas de cofres encontradas: ${allVaultGoals.length}`);

    const allGoals = [...personalGoals, ...allVaultGoals];
    console.log(`  - Total de metas combinadas: ${allGoals.length}`);

    return {
      goals: allGoals as Goal[],
      vaults: userVaults as Vault[],
    };
  } catch (error) {
    console.error('❌ getGoalsPageData - Erro ao buscar dados:', error);
    return { goals: [], vaults: [] };
  }
}

export async function getUserAllGoals(userId: string) {
  try {
    const userVaults = await VaultService.getUserVaults(userId);
    const personalGoals = await GoalService.getUserGoals(userId);
    
    const vaultGoalsPromises = userVaults.map(vault => GoalService.getVaultGoals(vault.id));
    const vaultGoalsArrays = await Promise.all(vaultGoalsPromises);
    const allVaultGoals = vaultGoalsArrays.flat();

    const allGoals = [...personalGoals, ...allVaultGoals];
    
    return {
      goals: allGoals as Goal[],
      vaults: userVaults as Vault[],
    };
  } catch (error) {
    console.error('Erro ao buscar todas as metas do usuário:', error);
    return { goals: [], vaults: [] };
  }
}

export async function toggleFeaturedGoalAction(goalId: string): Promise<{ success: boolean; message: string }> {
  try {
    await GoalService.toggleFeatured(goalId);
    revalidatePath('/dashboard');
    revalidatePath('/goals');
    return { success: true, message: 'Status de destaque da meta alterado.' };
  } catch (error) {
    return { success: false, message: 'Erro ao alterar o status de destaque da meta.' };
  }
}

export async function getGoalDetails(goalId: string, userId: string) {
  try {
    const [goal, transactions, accounts, vaults] = await Promise.all([
      GoalService.getGoalById(goalId),
      TransactionService.getTransactionsForGoal(goalId),
      AccountService.getUserAccounts(userId),
      VaultService.getUserVaults(userId),
    ]);

    if (!goal) return null;

    // Lógica de permissão: o usuário deve ser o dono ou participante
    const isOwner = (goal.ownerType === 'user' && goal.userId === userId) || (goal.ownerType === 'vault' && vaults.some(v => v.id === goal.vaultId));
    if (!isOwner) return null;

    return {
      goal: goal as Goal,
      transactions: transactions as Transaction[],
      accounts: accounts as Account[],
      vaults: vaults as Vault[],
    };
  } catch (error) {
    console.error("Erro ao buscar detalhes da meta:", error);
    return null;
  }
}

export async function depositToGoalAction(goalId: string, amount: number, accountId: string, description: string): Promise<{ success: boolean; message: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: 'Usuário não autenticado' };

  if (!amount || amount <= 0) return { success: false, message: 'O valor deve ser positivo.' };
  if (!accountId) return { success: false, message: 'Conta de origem não selecionada.' };

  try {
    await TransactionService.createTransaction({
      actorId: session.user.id,
      date: new Date(),
      description: description || `Depósito na caixinha`,
      amount,
      type: 'transfer',
      category: 'Caixinha',
      sourceAccountId: accountId,
      goalId,
    });
    revalidatePath(`/goals/${goalId}`);
    return { success: true, message: 'Dinheiro guardado com sucesso!' };
  } catch (error) {
    return { success: false, message: 'Erro ao guardar dinheiro.' };
  }
}

export async function withdrawFromGoalAction(goalId: string, amount: number, accountId: string, description: string): Promise<{ success: boolean; message: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: 'Usuário não autenticado' };

  if (!amount || amount <= 0) return { success: false, message: 'O valor deve ser positivo.' };
  if (!accountId) return { success: false, message: 'Conta de destino não selecionada.' };

  try {
    await TransactionService.createTransaction({
      actorId: session.user.id,
      date: new Date(),
      description: description || 'Retirada da caixinha',
      amount,
      type: 'transfer',
      category: 'Caixinha',
      destinationAccountId: accountId,
      goalId,
    });
    revalidatePath(`/goals/${goalId}`);
    return { success: true, message: 'Dinheiro retirado com sucesso!' };
  } catch (error) {
    return { success: false, message: 'Erro ao retirar dinheiro.' };
  }
}

const updateGoalSchema = goalSchema.omit({ ownerId: true, ownerType: true }).extend({
  id: z.string().min(1, 'ID da meta é obrigatório.'),
});

export async function updateGoalAction(prevState: GoalActionState, formData: FormData): Promise<GoalActionState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: 'Usuário não autenticado.' };

  const validatedFields = updateGoalSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'Erro de validação.' };
  }
  
  try {
    await GoalService.updateGoal(validatedFields.data.id, validatedFields.data);
    revalidatePath('/goals');
    revalidatePath(`/goals/${validatedFields.data.id}`);
    revalidatePath(`/goals/${validatedFields.data.id}/manage`);
    return { success: true, message: 'Caixinha atualizada com sucesso!' };
  } catch (error) {
    return { success: false, message: 'Erro ao atualizar caixinha.' };
  }
}

export async function deleteGoalAction(goalId: string): Promise<{ success: boolean; message: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: 'Usuário não autenticado.' };
  
  try {
    // Adicionar verificação de permissão aqui se necessário
    await GoalService.deleteGoal(goalId);
    revalidatePath('/goals');
  } catch (error) {
    return { success: false, message: 'Erro ao excluir caixinha.' };
  }
  
  redirect('/goals');
}

export async function getGoalManageData(goalId: string, userId: string) {
  try {
    const [goal, vaults, currentUser, currentVault] = await Promise.all([
      GoalService.getGoalById(goalId),
      VaultService.getUserVaults(userId),
      // Adicionado para ter o objeto do usuário atual
      prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, avatarUrl: true, email: true, subscriptionStatus: true } }),
      // Adicionado para ter o objeto do cofre atual
      VaultService.getVaultById(goal.vaultId || '')
    ]);

    if (!goal || !currentUser) return null;

    // Permissão: usuário deve ser o dono da meta pessoal, ou membro do cofre da meta
    const isPersonalGoalOwner = goal.ownerType === 'user' && goal.userId === userId;
    const isVaultMember = goal.ownerType === 'vault' && vaults.some(v => v.id === goal.vaultId);
    if (!isPersonalGoalOwner && !isVaultMember) return null;

    return {
      goal: goal as Goal,
      participants: goal.participants.map((p: any) => ({
        id: p.user.id,
        name: p.user.name,
        avatarUrl: p.user.avatarUrl,
        role: p.role,
      })) as GoalParticipant[],
      currentUser: currentUser as User,
      currentVault: currentVault as Vault | null
    };

  } catch (error) {
    console.error("Erro ao buscar dados de gerenciamento da meta:", error);
    return null;
  }
}
