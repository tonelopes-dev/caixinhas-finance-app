
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { GoalService } from '@/services/goal.service';
import { VaultService } from '@/services/vault.service';
import { TransactionService } from '@/services/transaction.service';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

// --- TIPOS DE ESTADO PARA ACTIONS ---
export type GoalFormState = {
  success?: boolean;
  message?: string;
  errors?: { [key: string]: string[] | undefined };
};

export type TransactionFormState = GoalFormState; // Reutilizando a estrutura

// --- FUNÇÕES DE PRÉ-PROCESSAMENTO E ESQUEMAS ZOD ---

const moneyPreprocess = (val: unknown) => {
  if (typeof val === 'string' && val) {
    const sanitizedString = val.replace(/\./g, '').replace(',', '.');
    return parseFloat(sanitizedString);
  }
  if (val === '' || val === null || val === undefined) return 0; // Trata como 0 para ser pego pelo .positive()
  return val;
};

const positiveNumberSchema = z.number({
  invalid_type_error: 'O valor deve ser um número.',
}).positive('O valor deve ser positivo.');

const goalSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  emoji: z.string().min(1, 'O emoji é obrigatório.'),
  targetAmount: z.preprocess(moneyPreprocess, positiveNumberSchema),
  visibility: z.enum(['private', 'shared']),
  ownerType: z.enum(['user', 'vault']),
  ownerId: z.string().min(1, 'O proprietário é obrigatório.'),
});

const transactionSchema = z.object({
    goalId: z.string().min(1, 'A meta é obrigatória.'),
    amount: z.preprocess(moneyPreprocess, positiveNumberSchema),
    description: z.string().optional(),
});

// --- ACTIONS ---

export async function createGoalAction(prevState: GoalFormState, formData: FormData): Promise<GoalFormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { message: 'Usuário não autenticado' };

  const validatedFields = goalSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await GoalService.createGoal({ ...validatedFields.data, userId: session.user.id });
  } catch (error) {
    return { message: 'Ocorreu um erro ao criar a caixinha.' };
  }

  revalidatePath('/goals');
  revalidatePath('/dashboard');
  return { success: true, message: 'Caixinha criada com sucesso!' };
}


async function handleTransaction(formData: FormData, type: 'deposit' | 'withdraw'): Promise<TransactionFormState> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { message: 'Usuário não autenticado' };

    const validatedFields = transactionSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const { amount, goalId, description } = validatedFields.data;
    const finalAmount = type === 'withdraw' ? -amount : amount;

    try {
        await TransactionService.createTransaction({
            amount: finalAmount,
            goalId,
            userId: session.user.id,
            description: description || (type === 'deposit' ? 'Depósito' : 'Retirada'),
        });
        
        await GoalService.updateBalance(goalId, finalAmount);

    } catch (error) {
        console.error(`❌ Erro ao processar ${type}:`, error);
        return { message: `Ocorreu um erro ao realizar o ${type}.` };
    }

    revalidatePath('/goals');
    revalidatePath(`/goals/${goalId}`);
    revalidatePath('/dashboard');
    return { success: true, message: `${type === 'deposit' ? 'Depósito' : 'Retirada'} realizado com sucesso!` };
}


export async function depositToGoalAction(prevState: TransactionFormState, formData: FormData): Promise<TransactionFormState> {
    return handleTransaction(formData, 'deposit');
}

export async function withdrawFromGoalAction(prevState: TransactionFormState, formData: FormData): Promise<TransactionFormState> {
    return handleTransaction(formData, 'withdraw');
}


// --- FUNÇÕES DE BUSCA DE DADOS ---

export async function getGoalsPageData(userId: string) {
  try {
    const userVaults = await VaultService.getUserVaults(userId);
    const personalGoalsPromise = GoalService.getGoals(userId, 'user');
    const vaultGoalsPromises = userVaults.map(vault => GoalService.getGoals(vault.id, 'vault'));

    const [personalGoals, ...vaultGoalsArrays] = await Promise.all([
      personalGoalsPromise,
      ...vaultGoalsPromises,
    ]);
    
    const allVaultGoals = vaultGoalsArrays.flat();
    const allGoals = [...personalGoals, ...allVaultGoals];

    return { goals: allGoals, vaults: userVaults };
  } catch (error) {
    console.error('❌ getGoalsPageData - Erro ao buscar dados:', error);
    return { goals: [], vaults: [] };
  }
}

export async function getGoalDetails(goalId: string, userId: string) {
  const goal = await GoalService.getGoalById(goalId);
  if (!goal) return null;

  const isOwner = goal.ownerType === 'user' && goal.ownerId === userId;
  const isVaultMember = goal.ownerType === 'vault' && await VaultService.isUserInVault(userId, goal.ownerId);
  if (!isOwner && !isVaultMember) return null;

  const [transactions, vaults] = await Promise.all([
    GoalService.getGoalTransactions(goalId),
    VaultService.getUserVaults(userId)
  ]);

  return { goal, transactions, accounts: [], vaults }; // Accounts é placeholder
}


// --- OUTRAS ACTIONS ---

export async function toggleFeaturedGoalAction(goalId: string) {
  try {
    await GoalService.toggleFeatured(goalId);
    revalidatePath('/dashboard');
    revalidatePath('/goals');
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Erro ao alterar o destaque.' };
  }
}

export async function deleteGoalAction(goalId: string): Promise<{ success: boolean; message: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: 'Usuário não autenticado.' };
  
  try {
    // TODO: Adicionar verificação de permissão aqui
    await GoalService.deleteGoal(goalId);
    revalidatePath('/goals');
  } catch (error) {
    return { success: false, message: 'Erro ao excluir caixinha.' };
  }
  
  redirect('/goals');
}
