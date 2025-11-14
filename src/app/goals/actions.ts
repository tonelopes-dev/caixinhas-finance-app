
"use server";

import { GoalService, AuthService, VaultService, TransactionService } from '@/services';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { cookies } from 'next/headers';

const createGoalSchema = z.object({
  name: z.string().min(1, { message: 'O nome da caixinha é obrigatório.' }),
  targetAmount: z.coerce.number().positive({ message: 'O valor deve ser maior que zero.' }),
  emoji: z.string().min(1, { message: 'Selecione um emoji para a caixinha.' }),
  visibility: z.enum(['private', 'shared'], { message: 'Visibilidade inválida.' }),
});

export type GoalActionState = {
  message?: string | null;
  errors?: {
    name?: string[];
    targetAmount?: string[];
    emoji?: string[];
    visibility?: string[];
  };
};

/**
 * Busca todas as metas do usuário (pessoais e de todos os vaults)
 */
export async function getUserAllGoals(userId: string) {
  try {
    // Buscar metas pessoais
    const personalGoals = await GoalService.getUserGoals(userId);

    // Buscar vaults do usuário
    const userVaults = await VaultService.getUserVaults(userId);

    // Buscar metas de cada vault
    const vaultGoalsPromises = userVaults.map((vault) =>
      GoalService.getVaultGoals(vault.id)
    );
    const vaultGoalsArrays = await Promise.all(vaultGoalsPromises);
    const vaultGoals = vaultGoalsArrays.flat();

    // Combinar todas as metas
    const allGoals = [...personalGoals, ...vaultGoals];

    // Formatar dados
    const formattedGoals = allGoals.map((goal) => ({
      id: goal.id,
      name: goal.name,
      emoji: goal.emoji,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      visibility: goal.visibility as 'private' | 'shared',
      isFeatured: goal.isFeatured,
      ownerId: goal.userId || goal.vaultId,
      ownerType: goal.userId ? 'user' : 'vault',
      participants: goal.participants?.map((p: any) => ({
        id: p.user.id,
        name: p.user.name,
        avatarUrl: p.user.avatarUrl || '',
        role: p.role,
      })) || [],
    }));

    // Buscar informações dos vaults
    const formattedVaults = userVaults.map((vault) => ({
      id: vault.id,
      name: vault.name,
      imageUrl: vault.imageUrl || '',
      ownerId: vault.ownerId,
      members: vault.members?.map((m: any) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatarUrl: m.user.avatarUrl || '',
      })) || [],
    }));

    return {
      goals: formattedGoals,
      vaults: formattedVaults,
    };
  } catch (error) {
    console.error('Erro ao buscar metas do usuário:', error);
    return { goals: [], vaults: [] };
  }
}

/**
 * Busca detalhes de uma meta específica
 */
export async function getGoalDetails(goalId: string) {
  try {
    const goal = await GoalService.getGoalById(goalId);

    if (!goal) {
      return null;
    }

    // Buscar transações relacionadas à meta
    const transactions = await TransactionService.getTransactions(
      goal.userId || goal.vaultId,
      goal.userId ? 'user' : 'vault'
    );

    // Filtrar transações que envolvem esta meta
    const goalTransactions = transactions.filter(
      (t) => t.goalId === goalId
    );
    
    return {
      goal: {
        id: goal.id,
        name: goal.name,
        emoji: goal.emoji,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        visibility: goal.visibility as 'private' | 'shared',
        isFeatured: goal.isFeatured,
        ownerId: goal.userId || goal.vaultId,
        ownerType: goal.userId ? 'user' : 'vault',
        participants: goal.participants?.map((p: any) => ({
          id: p.user.id,
          name: p.user.name,
          avatarUrl: p.user.avatarUrl || '',
          role: p.role,
        })) || [],
      },
      transactions: goalTransactions.map((t:any) => ({
        id: t.id,
        date: t.date.toISOString(),
        description: t.description,
        amount: t.amount,
        type: t.type as 'income' | 'expense' | 'transfer',
        category: t.category,
        actorId: t.actorId,
        sourceAccountId: t.sourceAccountId,
        destinationAccountId: t.destinationAccountId,
      })),
    };
  } catch (error) {
    console.error('Erro ao buscar detalhes da meta:', error);
    return null;
  }
}

/**
 * Cria uma nova meta
 */
export async function createGoalAction(
  prevState: GoalActionState,
  formData: FormData
): Promise<GoalActionState> {
  const cookieStore = await cookies();
  const userId = cookieStore.get('CAIXINHAS_USER_ID')?.value;
  const workspaceId = cookieStore.get('CAIXINHAS_VAULT_ID')?.value || userId;

  if (!userId || !workspaceId) {
    return {
      message: 'Usuário não autenticado',
      errors: {},
    };
  }

  const validatedFields = createGoalSchema.safeParse({
    name: formData.get('name'),
    targetAmount: formData.get('targetAmount'),
    emoji: formData.get('emoji'),
    visibility: formData.get('visibility'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Falha na validação. Por favor, verifique os campos.',
    };
  }

  try {
    const isPersonalWorkspace = workspaceId === userId;
    const ownerType = isPersonalWorkspace ? 'user' : 'vault';

    await GoalService.createGoal({
      name: validatedFields.data.name,
      targetAmount: validatedFields.data.targetAmount,
      emoji: validatedFields.data.emoji,
      visibility: validatedFields.data.visibility,
      ownerId: workspaceId,
      ownerType,
    });

    revalidatePath('/goals');
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Erro ao criar meta:', error);
    return {
      message: 'Erro ao criar caixinha. Tente novamente.',
      errors: {},
    };
  }

  redirect('/goals');
}

/**
 * Atualiza uma meta existente
 */
export async function updateGoalAction(
  prevState: GoalActionState,
  formData: FormData,
): Promise<GoalActionState> {
  const cookieStore = await cookies();
  const userId = cookieStore.get('CAIXINHAS_USER_ID')?.value;
  
  if (!userId) {
    return { message: 'Usuário não autenticado' };
  }

  const goalId = formData.get('id') as string;
  if (!goalId) {
    return { message: 'ID da meta não encontrado' };
  }
  
  const validatedFields = createGoalSchema.safeParse({
    name: formData.get('name'),
    targetAmount: formData.get('targetAmount'),
    emoji: formData.get('emoji'),
    visibility: formData.get('visibility'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Falha na validação.',
    };
  }

  try {
    await GoalService.updateGoal(goalId, validatedFields.data);

    revalidatePath('/goals');
    revalidatePath(`/goals/${goalId}`);
    revalidatePath(`/goals/${goalId}/manage`);
    revalidatePath('/dashboard');

    return { message: 'Meta atualizada com sucesso!' };
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    return { message: 'Erro ao atualizar meta.' };
  }
}


/**
 * Deleta uma meta
 */
export async function deleteGoalAction(goalId: string) {
  try {
    await GoalService.deleteGoal(goalId);

    revalidatePath('/goals');
    revalidatePath('/dashboard');

    return { success: true, message: 'Caixinha excluída com sucesso!' };
  } catch (error) {
    console.error('Erro ao deletar meta:', error);
    return { success: false, message: 'Erro ao excluir caixinha.' };
  }
}

/**
 * Alterna o status de destaque de uma meta
 */
export async function toggleFeaturedGoalAction(goalId: string) {
  try {
    await GoalService.toggleFeatured(goalId);

    revalidatePath('/goals');
    revalidatePath('/dashboard');

    return { success: true, message: 'Status de destaque atualizado!' };
  } catch (error) {
    console.error('Erro ao alternar destaque:', error);
    return { success: false, message: 'Erro ao atualizar destaque.' };
  }
}

/**
 * Adiciona valor a uma meta (depósito)
 */
export async function depositToGoalAction(goalId: string, amount: number, description: string) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('CAIXINHAS_USER_ID')?.value;

    if (!userId) {
      return { success: false, message: 'Usuário não autenticado' };
    }

    // Adicionar valor à meta
    await GoalService.addToGoal(goalId, amount);

    // Criar transação de registro
    const goal = await GoalService.getGoalById(goalId);
    if (goal) {
      await TransactionService.createTransaction({
        userId: goal.userId,
        vaultId: goal.vaultId,
        date: new Date(),
        description: description || `Depósito na caixinha ${goal.name}`,
        amount,
        type: 'transfer',
        category: 'savings',
        destinationAccountId: goalId,
        actorId: userId,
      });
    }

    revalidatePath(`/goals/${goalId}`);
    revalidatePath('/dashboard');

    return { success: true, message: 'Depósito realizado com sucesso!' };
  } catch (error) {
    console.error('Erro ao depositar na meta:', error);
    return { success: false, message: 'Erro ao realizar depósito.' };
  }
}

/**
 * Remove valor de uma meta (retirada)
 */
export async function withdrawFromGoalAction(goalId: string, amount: number, description: string) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('CAIXINHAS_USER_ID')?.value;

    if (!userId) {
      return { success: false, message: 'Usuário não autenticado' };
    }

    // Remover valor da meta
    await GoalService.removeFromGoal(goalId, amount);

    // Criar transação de registro
    const goal = await GoalService.getGoalById(goalId);
    if (goal) {
      await TransactionService.createTransaction({
        userId: goal.userId,
        vaultId: goal.vaultId,
        date: new Date(),
        description: description || `Retirada da caixinha ${goal.name}`,
        amount,
        type: 'transfer',
        category: 'savings',
        sourceAccountId: goalId,
        actorId: userId,
      });
    }

    revalidatePath(`/goals/${goalId}`);
    revalidatePath('/dashboard');

    return { success: true, message: 'Retirada realizada com sucesso!' };
  } catch (error) {
    console.error('Erro ao retirar da meta:', error);
    return { success: false, message: 'Erro ao realizar retirada.' };
  }
}

/**
 * Busca dados para a página de gerenciar goal
 */
export async function getGoalManageData(goalId: string) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('CAIXINHAS_USER_ID')?.value;
    
    if (!userId) {
      return null;
    }

    const goal = await GoalService.getGoalById(goalId);
    if (!goal) {
      return null;
    }

    // Buscar dados do usuário atual
    const currentUser = await AuthService.getUserById(userId);
    if (!currentUser) {
      return null;
    }

    // Se for um goal de vault, buscar dados do vault
    let currentVault = null;
    if (goal.vaultId) {
      currentVault = await VaultService.getVaultById(goal.vaultId);
    }

    return {
      goal,
      currentUser,
      currentVault,
    };
    
  } catch (error) {
    console.error('Erro ao buscar dados da goal:', error);
    return null;
  }
}
