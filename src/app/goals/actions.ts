
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { GoalService } from '@/services/goal.service';
import { VaultService } from '@/services/vault.service';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

// --- Tipos de Estado para Actions ---
export type GoalFormState = {
  success?: boolean;
  message?: string;
  errors?: { [key: string]: string[] | undefined };
};

export type TransactionFormState = GoalFormState;

// --- Esquemas de Validação com Zod ---

const currencyPreprocess = (val: unknown) => {
  if (typeof val === 'string' && val) {
    const sanitizedString = val.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(sanitizedString);
    return isNaN(num) ? val : num;
  }
  if (val === '' || val === null) return 0; 
  return val;
};

const goalSchema = z.object({
  name: z.string().min(1, 'O nome da caixinha é obrigatório.'),
  emoji: z.string().min(1, 'O emoji é obrigatório.'),
  targetAmount: z.preprocess(currencyPreprocess, z.number().positive('O valor alvo deve ser positivo.')),
  visibility: z.enum(['private', 'shared']),
  ownerType: z.enum(['user', 'vault']),
  ownerId: z.string().min(1, 'O proprietário é obrigatório.'),
});

const transactionSchema = z.object({
    goalId: z.string().min(1),
    amount: z.preprocess(currencyPreprocess, z.number().positive('O valor da transação deve ser positivo.')),
    description: z.string().optional(),
});


// --- Actions para Metas (Goals) ---

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
  // O redirect é melhor tratado no client-side após a confirmação de sucesso.
  return { success: true };
}

export async function deleteGoalAction(goalId: string): Promise<{ success: boolean; message: string }> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, message: 'Usuário não autenticado.' };
    
    try {
      await GoalService.deleteGoal(goalId, session.user.id); // Adicionar verificação de permissão
      revalidatePath('/goals');
      revalidatePath('/dashboard');
    } catch (error) {
      return { success: false, message: 'Erro ao excluir caixinha.' };
    }
    
    redirect('/goals');
}

export async function toggleFeaturedGoalAction(goalId: string) {
    try {
      await GoalService.toggleFeatured(goalId);
      revalidatePath('/dashboard');
      revalidatePath('/goals');
      return { success: true, message: 'Status de destaque da meta alterado.' };
    } catch (error) {
      return { success: false, message: 'Erro ao alterar o status de destaque da meta.' };
    }
}


// --- Actions para Transações (Depósito/Retirada) ---

export async function depositToGoalAction(prevState: TransactionFormState, formData: FormData): Promise<TransactionFormState> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { message: 'Usuário não autenticado' };

    const validatedFields = transactionSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await GoalService.createTransaction({
            ...validatedFields.data,
            type: 'deposit',
            userId: session.user.id
        });
        revalidatePath(`/goals/${validatedFields.data.goalId}`);
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        return { message: 'Falha ao realizar o depósito.' };
    }
}

export async function withdrawFromGoalAction(prevState: TransactionFormState, formData: FormData): Promise<TransactionFormState> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { message: 'Usuário não autenticado' };

    const validatedFields = transactionSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await GoalService.createTransaction({
            ...validatedFields.data,
            type: 'withdrawal',
            userId: session.user.id
        });
        revalidatePath(`/goals/${validatedFields.data.goalId}`);
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        // Captura o erro específico de saldo insuficiente
        if (error.code === 'INSUFFICIENT_BALANCE') {
            return { errors: { amount: [error.message] } };
        }
        return { message: 'Falha ao realizar a retirada.' };
    }
}

// --- Funções de Busca de Dados ---

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
    return { goals: [], vaults: [] };
  }
}

export async function getGoalDetails(goalId: string, userId: string) {
    const goal = await GoalService.getGoalById(goalId);
    if (!goal) return null;
  
    const isOwner = goal.ownerType === 'user' && goal.ownerId === userId;
    const isVaultMember = goal.ownerType === 'vault' && await VaultService.isUserInVault(userId, goal.ownerId);
  
    if (!isOwner && !isVaultMember) return null;

    const [transactions, accounts, vaults] = await Promise.all([
      GoalService.getGoalTransactions(goalId),
      [], // Placeholder
      VaultService.getUserVaults(userId)
    ]);
  
    return { goal, transactions, accounts, vaults };
}
