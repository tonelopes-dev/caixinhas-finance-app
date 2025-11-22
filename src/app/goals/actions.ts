
"use server";

import { GoalService, AuthService, VaultService, TransactionService, AccountService } from '@/services';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
 * Busca detalhes de uma meta específica, incluindo contas do usuário
 */
export async function getGoalDetails(goalId: string, userId: string) {
  try {
    const [goal, goalTransactions, userAccounts] = await Promise.all([
        GoalService.getGoalById(goalId),
        TransactionService.getTransactionsForGoal(goalId),
        AccountService.getUserAccounts(userId)
    ]);


    if (!goal) {
      return null;
    }

    const nonCreditAccounts = userAccounts.filter(a => a.type !== 'credit_card');
    
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
        category: t.category.name,
        actorId: t.actorId,
        sourceAccountId: t.sourceAccountId,
        destinationAccountId: t.destinationAccountId,
        ownerId: t.userId || t.vaultId,
      })),
      accounts: nonCreditAccounts,
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      message: 'Usuário não autenticado',
      errors: {},
    };
  }
  const userId = session.user.id;

  const workspaceId = cookies().get('CAIXINHAS_VAULT_ID')?.value || userId;

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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
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
 * Adiciona valor a uma meta (depósito) criando uma transação.
 */
export async function depositToGoalAction(
  goalId: string,
  amount: number,
  sourceAccountId: string,
  description: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: 'Usuário não autenticado' };
  }
  const userId = session.user.id;

  try {
    const goal = await GoalService.getGoalById(goalId);
    if (!goal) {
      return { success: false, message: 'Caixinha não encontrada.' };
    }

    // A lógica foi centralizada no TransactionService
    // A ação agora apenas cria a transação do tipo transferência
    await TransactionService.createTransaction({
      userId: goal.userId, // Preserva o dono original da transação
      vaultId: goal.vaultId,
      date: new Date(),
      description: description || `Depósito na caixinha ${goal.name}`,
      amount,
      type: 'transfer',
      category: 'Caixinha',
      sourceAccountId,
      destinationAccountId: null, // O destino é a caixinha
      goalId,
      actorId: userId,
    });

    revalidatePath(`/goals/${goalId}`);
    revalidatePath('/dashboard');
    revalidatePath('/accounts');
    revalidatePath('/patrimonio');

    return { success: true, message: 'Depósito realizado com sucesso!' };
  } catch (error) {
    console.error('Erro ao depositar na meta:', error);
    return { success: false, message: 'Erro ao realizar depósito.' };
  }
}

/**
 * Remove valor de uma meta (retirada) criando uma transação.
 */
export async function withdrawFromGoalAction(
  goalId: string,
  amount: number,
  destinationAccountId: string,
  description: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: 'Usuário não autenticado' };
  }
  const userId = session.user.id;
  
  try {
    const goal = await GoalService.getGoalById(goalId);
    if (!goal) {
      return { success: false, message: 'Caixinha não encontrada.' };
    }

    // A lógica foi centralizada no TransactionService
    await TransactionService.createTransaction({
      userId: goal.userId,
      vaultId: goal.vaultId,
      date: new Date(),
      description: description || `Retirada da caixinha ${goal.name}`,
      amount,
      type: 'transfer',
      category: 'Caixinha',
      sourceAccountId: null, // A origem é a caixinha
      goalId,
      destinationAccountId,
      actorId: userId,
    });

    revalidatePath(`/goals/${goalId}`);
    revalidatePath('/dashboard');
    revalidatePath('/accounts');
    revalidatePath('/patrimonio');
    
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return null;
    }
    const userId = session.user.id;

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
