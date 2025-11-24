
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { GoalService } from '@/services/goal.service';
import { VaultService } from '@/services/vault.service';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

// Tipos para o estado da ação do formulário
export type GoalFormState = {
  success?: boolean;
  message?: string;
  errors?: {
    name?: string[];
    emoji?: string[];
    targetAmount?: string[];
    visibility?: string[];
    ownerType?: string[];
    ownerId?: string[];
  };
};

// Esquema de validação para a criação de metas usando preprocess para robustez
const goalSchema = z.object({
  name: z.string().min(1, 'O nome da caixinha é obrigatório.'),
  emoji: z.string().min(1, 'O emoji é obrigatório.'),
  targetAmount: z.preprocess(
    (val) => {
      // Trata formatos monetários brasileiros como "1.500,00"
      if (typeof val === 'string' && val) {
        const sanitizedString = val.replace(/\./g, '').replace(',', '.');
        return parseFloat(sanitizedString);
      }
      if (val === '') return 0; // Trata string vazia como 0 para ser pego pelo .positive()
      return val;
    },
    z.number({
      invalid_type_error: 'O valor da meta deve ser um número.',
    }).positive('O valor alvo deve ser positivo.')
  ),
  visibility: z.enum(['private', 'shared'], {
    errorMap: () => ({ message: 'Visibilidade inválida.' }),
  }),
  ownerType: z.enum(['user', 'vault'], {
    errorMap: () => ({ message: 'Tipo de proprietário inválido.' }),
  }),
  ownerId: z.string().min(1, 'O proprietário é obrigatório.'),
});

// Função para criar uma nova meta, compatível com useActionState
export async function createGoalAction(prevState: GoalFormState, formData: FormData): Promise<GoalFormState> {
  console.log('🎯 createGoalAction - Iniciando...');
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { message: 'Usuário não autenticado' };
  }

  const rawFormData = Object.fromEntries(formData.entries());

  const validatedFields = goalSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    console.log('❌ createGoalAction - Validação falhou:', fieldErrors);
    return { errors: fieldErrors };
  }

  try {
    await GoalService.createGoal({
      ...validatedFields.data,
      userId: session.user.id, 
    });
    console.log('✅ createGoalAction - Meta criada com sucesso.');
  } catch (error) {
    console.error('❌ createGoalAction - Erro ao criar meta:', error);
    return { message: 'Ocorreu um erro ao criar a caixinha.' };
  }

  revalidatePath('/goals');
  revalidatePath('/dashboard');
  return { success: true };
}

// Função para obter todos os dados necessários para a página de metas
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
      goals: allGoals,
      vaults: userVaults,
    };
  } catch (error) {
    console.error('❌ getGoalsPageData - Erro ao buscar dados:', error);
    return { goals: [], vaults: [] };
  }
}

export async function getGoalDetails(goalId: string, userId: string) {
  const goal = await GoalService.getGoalById(goalId);

  if (!goal) return null;

  // Basic permission check
  const isOwner = goal.ownerType === 'user' && goal.ownerId === userId;
  const isVaultMember = goal.ownerType === 'vault' && await VaultService.isUserInVault(userId, goal.ownerId);

  if (!isOwner && !isVaultMember) {
    return null; 
  }

  const [transactions, accounts, vaults] = await Promise.all([
    GoalService.getGoalTransactions(goalId),
    [], // Placeholder for accounts
    VaultService.getUserVaults(userId)
  ]);

  return { goal, transactions, accounts, vaults };
}


// Função para alternar o status de 'destaque' de uma meta
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
