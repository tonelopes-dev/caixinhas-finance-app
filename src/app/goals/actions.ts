
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

export async function getGoalsPageData(userId: string) {
  try {
    const cookieStore = await cookies();
    const workspaceId = cookieStore.get('CAIXINHAS_VAULT_ID')?.value || userId;
    const isPersonalWorkspace = workspaceId === userId;

    let goalsForWorkspace = [];
    if (isPersonalWorkspace) {
      goalsForWorkspace = await GoalService.getUserGoals(userId);
    } else {
      goalsForWorkspace = await GoalService.getVaultGoals(workspaceId);
    }

    const userVaults = await VaultService.getUserVaults(userId);

    const formattedGoals = goalsForWorkspace.map((goal) => ({
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
    console.error('Erro ao buscar dados da página de caixinhas:', error);
    return { goals: [], vaults: [] };
  }
}

export async function getGoalDetails(goalId: string, userId: string) {
  try {
    const cookieStore = await cookies();
    const workspaceId = cookieStore.get('CAIXINHAS_VAULT_ID')?.value || userId;

    const goal = await GoalService.getGoalById(goalId);
    if (!goal) {
      return null;
    }

    const isOwner = goal.userId === workspaceId || goal.vaultId === workspaceId;
    if (!isOwner) {
      return null;
    }

    const [goalTransactions, userAccounts, userVaults] = await Promise.all([
      TransactionService.getTransactionsForGoal(goalId),
      AccountService.getUserAccounts(userId),
      VaultService.getUserVaults(userId) // Adicionado para obter os nomes dos cofres
    ]);

    const nonCreditAccounts = userAccounts.filter(a => a.type !== 'credit_card');

    const formattedGoal = {
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
    };

    const formattedTransactions = goalTransactions.map((t:any) => ({
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
    }));

    const formattedVaults = userVaults.map((vault) => ({
      id: vault.id,
      name: vault.name,
      imageUrl: vault.imageUrl || '',
    }));

    return {
      goal: formattedGoal,
      transactions: formattedTransactions,
      accounts: nonCreditAccounts,
      vaults: formattedVaults, // Retornado para o cliente
    };
  } catch (error) {
    console.error('Erro ao buscar detalhes da meta:', error);
    return null;
  }
}

// ... (createGoalAction e outras ações permanecem as mesmas)

export async function createGoalAction(
  prevState: GoalActionState,
  formData: FormData
): Promise<GoalActionState> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return { message: 'Usuário não autenticado' };
  }

  const validatedFields = createGoalSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Falha na validação.',
    };
  }

  try {
    const cookieStore = await cookies();
    const workspaceId = cookieStore.get('CAIXINHAS_VAULT_ID')?.value || userId;
    const isPersonal = workspaceId === userId;

    await GoalService.createGoal({
      ...validatedFields.data,
      ownerId: workspaceId,
      ownerType: isPersonal ? 'user' : 'vault',
    });

    revalidatePath('/goals');
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Erro ao criar meta:', error);
    return { message: 'Erro ao criar caixinha. Tente novamente.' };
  }

  redirect('/goals');
}
