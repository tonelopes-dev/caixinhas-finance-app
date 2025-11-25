
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { GoalService } from '@/services/goal.service';
import { VaultService } from '@/services/vault.service';
import { TransactionService } from '@/services/transaction.service';
import { AccountService } from '@/services/account.service'; // Importado
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

// --- TIPOS DE ESTADO PARA ACTIONS ---
export type GoalFormState = {
  success?: boolean;
  message?: string;
  errors?: { [key: string]: string[] | undefined };
};

export type TransactionFormState = GoalFormState;

// --- ESQUEMAS ZOD ---
const moneyPreprocess = (val: unknown) => {
  if (typeof val === 'string' && val) {
    const sanitizedString = val.replace(/\./g, '').replace(',', '.');
    return parseFloat(sanitizedString);
  }
  if (val === '' || val === null || val === undefined) return 0;
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

const updateGoalSchema = goalSchema.omit({ ownerType: true, ownerId: true }).extend({
  id: z.string().min(1, "ID da caixinha é obrigatório"),
});

// Esquema para transações de depósito/retirada
const goalTransactionSchema = z.object({
    goalId: z.string().min(1, 'A meta é obrigatória.'),
    accountId: z.string().min(1, 'A conta é obrigatória'),
    amount: z.preprocess(moneyPreprocess, positiveNumberSchema),
    description: z.string().optional(),
});

// --- ACTIONS ---

export async function createGoalAction(prevState: GoalFormState, formData: FormData): Promise<GoalFormState> {
  // Verifica se o usuário tem acesso completo
  const { requireFullAccess } = await import('@/lib/action-helpers');
  const accessCheck = await requireFullAccess();

  if (!accessCheck.success || !accessCheck.data) {
    return { message: accessCheck.error || 'Acesso negado' };
  }

  const validatedFields = goalSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await GoalService.createGoal(validatedFields.data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    return { message: `Ocorreu um erro ao criar a caixinha: ${errorMessage}` };
  }

  revalidatePath('/goals');
  revalidatePath('/dashboard');
  redirect('/goals');
}

export async function updateGoalAction(prevState: GoalFormState, formData: FormData): Promise<GoalFormState> {
  // Verifica se o usuário tem acesso completo
  const { requireFullAccess } = await import('@/lib/action-helpers');
  const accessCheck = await requireFullAccess();

  if (!accessCheck.success || !accessCheck.data) {
    return { message: accessCheck.error || 'Acesso negado' };
  }

  const validatedFields = updateGoalSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await GoalService.updateGoal(validatedFields.data.id, validatedFields.data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    return { message: `Ocorreu um erro ao atualizar a caixinha: ${errorMessage}` };
  }

  revalidatePath("/goals");
  revalidatePath(`/goals/${validatedFields.data.id}`);
  revalidatePath(`/goals/${validatedFields.data.id}/manage`);
  revalidatePath("/dashboard");
  return { success: true, message: "Caixinha atualizada com sucesso!" };
}

async function handleTransaction(formData: FormData, type: 'deposit' | 'withdraw'): Promise<TransactionFormState> {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) return { message: 'Usuário não autenticado' };

    const validatedFields = goalTransactionSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const { amount, goalId, accountId, description } = validatedFields.data;
    
    // Buscar a caixinha para obter userId ou vaultId
    const goal = await GoalService.getGoalById(goalId);
    if (!goal) {
        return { message: 'Caixinha não encontrada' };
    }
    
    // Validar saldo para retiradas
    if (type === 'withdraw') {
        if (goal.currentAmount < amount) {
            return { 
                message: `Saldo insuficiente. Saldo disponível: R$ ${goal.currentAmount.toFixed(2)}` 
            };
        }
    }
    
    const transactionData = {
        userId: goal.userId,
        vaultId: goal.vaultId,
        amount,
        goalId,
        actorId: userId,
        type: 'transfer' as 'transfer',
        date: new Date(),
        category: type === 'deposit' ? 'Depósito na Caixinha' : 'Retirada da Caixinha',
        description: description || (type === 'deposit' ? 'Depósito na Caixinha' : 'Retirada da Caixinha'),
        sourceAccountId: type === 'deposit' ? accountId : null,
        destinationAccountId: type === 'withdraw' ? accountId : null,
    };

    try {
        await TransactionService.createTransaction(transactionData);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        console.error(`❌ Erro ao processar ${type}:`, error);
        return { message: `Ocorreu um erro ao realizar o ${type}: ${errorMessage}` };
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

export async function deleteGoalAction(goalId: string): Promise<{ success: boolean; message: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: 'Usuário não autenticado.' };
  
  try {
    await GoalService.deleteGoal(goalId);
    revalidatePath('/goals');
    revalidatePath('/dashboard');
    return { success: true, message: 'Caixinha excluída com sucesso.' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    return { success: false, message: `Erro ao excluir caixinha: ${errorMessage}` };
  }
}

// --- FUNÇÕES DE BUSCA DE DADOS ---

export async function getGoalManageData(goalId: string, userId: string) {
  const goal = await GoalService.getGoalById(goalId);
  if (!goal) return null;

  let hasPermission = false;
  if (goal.vaultId) {
      hasPermission = await VaultService.isMember(goal.vaultId, userId);
  } else if (goal.userId) {
      hasPermission = goal.userId === userId;
  }

  if (!hasPermission) return null;

  const currentVault = goal.vaultId ? await VaultService.getVaultById(goal.vaultId) : null;

  return { goal, currentVault };
}

export async function getUserAllGoals(userId: string) {
  const personalGoals = await GoalService.getUserGoals(userId);
  const userVaults = await VaultService.getUserVaults(userId);
  const vaultGoalsPromises = userVaults.map(v => GoalService.getVaultGoals(v.id));
  const vaultGoals = (await Promise.all(vaultGoalsPromises)).flat();
  return { goals: [...personalGoals, ...vaultGoals] };
}

export async function getGoalsPageData(userId: string) {
  try {
    const userVaults = await VaultService.getUserVaults(userId);
    const { goals } = await getUserAllGoals(userId);
    return { goals, vaults: userVaults };
  } catch (error) {
    console.error('❌ getGoalsPageData - Erro ao buscar dados:', error);
    return { goals: [], vaults: [] };
  }
}

// CORRIGIDO: Busca e retorna as contas bancárias
export async function getGoalDetails(goalId: string, userId: string) {
  const goal = await GoalService.getGoalById(goalId);
  if (!goal) return null;

  let hasPermission = false;
  const scope = goal.vaultId || userId; // Define o scope para a busca de contas

  if (goal.vaultId) {
      hasPermission = await VaultService.isMember(goal.vaultId, userId);
  } else if (goal.userId) {
      hasPermission = goal.userId === userId;
  }

  if (!hasPermission) return null;

  const [transactions, vaults, accounts] = await Promise.all([
    TransactionService.getTransactionsForGoal(goalId),
    VaultService.getUserVaults(userId),
    AccountService.getVisibleAccounts(userId, scope) // Busca as contas
  ]);

  return { goal, transactions, accounts, vaults };
}

export async function toggleFeaturedGoalAction(goalId: string) {
  try {
    await GoalService.toggleFeatured(goalId);
    revalidatePath('/dashboard');
    revalidatePath('/goals');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    return { success: false, message: `Erro ao alterar o destaque: ${errorMessage}` };
  }
}
