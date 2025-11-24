
"use server";

import { GoalService } from '@/services/goal.service';
import { AuthService } from '@/services/auth.service';
import { VaultService } from '@/services/vault.service';
import { TransactionService } from '@/services/transaction.service';
import { AccountService } from '@/services/account.service';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Schemas
const goalSchema = z.object({
  name: z.string().min(1, { message: 'O nome é obrigatório.' }),
  targetAmount: z.string().min(1, { message: 'O valor alvo é obrigatório.' }).transform((val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) {
      throw new Error('O valor alvo deve ser um número positivo.');
    }
    return num;
  }),
  emoji: z.string().min(1, { message: 'O emoji é obrigatório.' }),
  visibility: z.enum(['private', 'shared'])
});

// Tipos de Estado
export type GoalActionState = {
  message?: string | null;
  errors?: {
    name?: string[];
    targetAmount?: string[];
    emoji?: string[];
    visibility?: string[];
  };
  success?: boolean;
};

async function getWorkspaceId(userId: string): Promise<string> {
  const cookieStore = await cookies();
  const vaultId = cookieStore.get('CAIXINHAS_VAULT_ID')?.value;
  if (vaultId) {
    const isMember = await VaultService.isMember(vaultId, userId);
    if (isMember) {
      return vaultId;
    }
  }
  return userId;
}

// Funções de Busca de Dados
export async function getGoalsPageData(userId: string) {
  try {
    const userVaults = await VaultService.getUserVaults(userId);
    console.log('🔍 User Vaults:', userVaults.length);

    const personalGoalsPromise = GoalService.getGoals(userId, 'user');
    const vaultGoalsPromises = userVaults.map(vault => GoalService.getGoals(vault.id, 'vault'));

    const [personalGoals, ...vaultsGoals] = await Promise.all([
      personalGoalsPromise,
      ...vaultGoalsPromises
    ]);

    const allGoals = [...personalGoals, ...vaultsGoals.flat()];
    console.log('🔍 Personal Goals:', personalGoals.length);
    console.log('🔍 Vault Goals:', vaultsGoals.flat().length);
    console.log('🔍 All Goals:', allGoals.length);

    return {
      goals: allGoals.map(g => ({ ...g, ownerType: g.userId ? 'user' : 'vault', ownerId: g.userId || g.vaultId, participants: g.participants || [] })),
      vaults: userVaults.map(v => ({ ...v, members: v.members || [] }))
    };
  } catch (error) {
    console.error('Erro ao buscar dados da página de metas:', error);
    return { goals: [], vaults: [] };
  }
}

export async function getGoalDetails(goalId: string, userId: string) {
  try {
    const workspaceId = await getWorkspaceId(userId);
    const goal = await GoalService.getGoalById(goalId);
    if (!goal || (goal.userId !== workspaceId && goal.vaultId !== workspaceId)) return null;

    const [transactions, accounts, vaults] = await Promise.all([
      TransactionService.getTransactionsForGoal(goalId),
      AccountService.getUserAccounts(userId),
      VaultService.getUserVaults(userId)
    ]);
    return {
      goal: { ...goal, ownerType: goal.userId ? 'user' : 'vault', ownerId: goal.userId || goal.vaultId, createdAt: goal.createdAt.toISOString(), participants: goal.participants || [] },
      transactions: transactions.map(t => ({...t, date: t.date.toISOString()})),
      accounts: accounts.filter(a => a.type !== 'credit_card'),
      vaults,
    };
  } catch (error) { console.error(error); return null; }
}

export async function getGoalManageData(goalId: string, userId: string) {
  try {
      const workspaceId = await getWorkspaceId(userId);
      const goal = await GoalService.getGoalById(goalId);
      if (!goal || (goal.userId !== workspaceId && goal.vaultId !== workspaceId)) return null;

      const participants = goal.participants?.map(p => ({ ...p.user, role: p.role })) || [];

      return {
          goal: { ...goal, ownerType: goal.userId ? 'user' : 'vault', ownerId: goal.userId || goal.vaultId },
          participants,
      };
  } catch (error) { console.error(error); return null; }
}

// Ações (CRUD)
export async function createGoalAction(prevState: GoalActionState, formData: FormData): Promise<GoalActionState> {
  console.log('🎯 createGoalAction - Iniciando...');
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.log('❌ createGoalAction - Usuário não autenticado');
    return { message: 'Usuário não autenticado' };
  }
  const userId = session.user.id;
  console.log('✅ createGoalAction - UserId:', userId);

  const validatedFields = goalSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    console.log('❌ createGoalAction - Validação falhou:', validatedFields.error);
    return { errors: validatedFields.error.flatten().fieldErrors };
  }
  console.log('✅ createGoalAction - Dados validados:', validatedFields.data);

  try {
    const workspaceId = await getWorkspaceId(userId);
    console.log('✅ createGoalAction - WorkspaceId:', workspaceId);
    
    const goalData = { 
      ...validatedFields.data, 
      ownerId: workspaceId, 
      ownerType: workspaceId === userId ? 'user' : 'vault' 
    };
    console.log('✅ createGoalAction - Criando caixinha com dados:', goalData);
    
    await GoalService.createGoal(goalData);
    console.log('✅ createGoalAction - Caixinha criada com sucesso!');
  } catch (error) { 
    console.error('❌ createGoalAction - Erro ao criar:', error); 
    return { message: 'Erro ao criar caixinha.' }; 
  }

  console.log('✅ createGoalAction - Revalidando paths...');
  revalidatePath('/goals');
  revalidatePath('/dashboard');
  console.log('✅ createGoalAction - Redirecionando para /goals');
  redirect('/goals');
}

export async function updateGoalAction(goalId: string, prevState: GoalActionState, formData: FormData): Promise<GoalActionState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { message: 'Usuário não autenticado' };
  const userId = session.user.id;

  const validatedFields = goalSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) return { errors: validatedFields.error.flatten().fieldErrors };

  try {
      const goal = await GoalService.getGoalById(goalId);
      if (!goal || (goal.userId !== userId && !await VaultService.isMember(goal.vaultId, userId))) return { message: 'Permissão negada.' };
      await GoalService.updateGoal(goalId, validatedFields.data);
  } catch (error) { console.error(error); return { message: 'Erro ao atualizar caixinha.' }; }

  revalidatePath(`/goals/${goalId}`)
  revalidatePath(`/goals/${goalId}/manage`)
  revalidatePath('/goals');
  return { success: true, message: 'Caixinha atualizada com sucesso!' };
}

export async function deleteGoalAction(goalId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { message: 'Usuário não autenticado' };
  const userId = session.user.id;

  try {
    const goal = await GoalService.getGoalById(goalId);
    if (!goal || (goal.userId !== userId && !await VaultService.isOwner(goal.vaultId, userId))) return { message: 'Permissão negada.' };
    await GoalService.deleteGoal(goalId);
  } catch (error) { console.error(error); return { message: 'Erro ao apagar caixinha.' }; }

  revalidatePath('/goals');
  revalidatePath('/dashboard');
  redirect('/goals');
}

// Ações de Transação e Destaque

export async function depositToGoalAction(goalId: string, amount: number, sourceAccountId: string, description: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: 'Não autenticado' };
  const userId = session.user.id;

  try {
    const workspaceId = await getWorkspaceId(userId);
    const goal = await GoalService.getGoalById(goalId);
    if (!goal || (goal.userId !== workspaceId && goal.vaultId !== workspaceId)) return { success: false, message: 'Permissão negada.' };

    await TransactionService.createTransaction({ userId: goal.userId, vaultId: goal.vaultId, date: new Date(), description: description || `Depósito na caixinha ${goal.name}`, amount, type: 'transfer', category: 'Caixinha', sourceAccountId, destinationAccountId: null, goalId, actorId: userId });
    
    revalidatePath(`/goals/${goalId}`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) { console.error(error); return { success: false, message: 'Erro no depósito.' }; }
}

export async function withdrawFromGoalAction(goalId: string, amount: number, destinationAccountId: string, description: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: 'Não autenticado' };
  const userId = session.user.id;

  try {
    const workspaceId = await getWorkspaceId(userId);
    const goal = await GoalService.getGoalById(goalId);
    if (!goal || (goal.userId !== workspaceId && goal.vaultId !== workspaceId)) return { success: false, message: 'Permissão negada.' };
    if (goal.currentAmount < amount) return { success: false, message: 'Saldo insuficiente.' };

    await TransactionService.createTransaction({ userId: goal.userId, vaultId: goal.vaultId, date: new Date(), description: description || `Retirada da caixinha ${goal.name}`, amount, type: 'transfer', category: 'Caixinha', sourceAccountId: null, destinationAccountId, goalId, actorId: userId });
    
    revalidatePath(`/goals/${goalId}`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) { console.error(error); return { success: false, message: 'Erro na retirada.' }; }
}

export async function toggleFeaturedGoalAction(goalId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: 'Não autenticado' };
  const userId = session.user.id;

  try {
    const goal = await GoalService.getGoalById(goalId);
    if (!goal || (goal.userId !== userId && !await VaultService.isMember(goal.vaultId, userId))) return { success: false, message: 'Permissão negada.' };

    await GoalService.updateGoal(goalId, { isFeatured: !goal.isFeatured });
    revalidatePath('/goals');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) { console.error(error); return { success: false, message: 'Erro ao favoritar.' }; }
}
