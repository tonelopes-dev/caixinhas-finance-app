
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { GoalService } from '@/services/goal.service';
import { VaultService } from '@/services/vault.service';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

// Esquema de validação para a criação de metas
const goalSchema = z.object({
  name: z.string().min(1, 'O nome da caixinha é obrigatório.'),
  emoji: z.string().min(1, 'O emoji é obrigatório.'),
  targetAmount: z.number().positive('O valor alvo deve ser positivo.'),
  visibility: z.enum(['private', 'shared'], {
    errorMap: () => ({ message: 'Visibilidade inválida.' }),
  }),
  ownerType: z.enum(['user', 'vault'], {
    errorMap: () => ({ message: 'Tipo de proprietário inválido.' }),
  }),
  ownerId: z.string().min(1, 'O proprietário é obrigatório.'),
});

// Função para criar uma nova meta
export async function createGoalAction(formData: FormData) {
  console.log('🎯 createGoalAction - Iniciando...');
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error('❌ createGoalAction - Usuário não autenticado.');
    return { error: 'Usuário não autenticado' };
  }

  const rawFormData = Object.fromEntries(formData.entries());

  // --- INÍCIO DA CORREÇÃO DE FORMATAÇÃO MONETÁRIA ---
  let cleanedTargetAmount = 0;
  if (typeof rawFormData.targetAmount === 'string') {
    const sanitizedString = rawFormData.targetAmount
      .replace(/\./g, '') // Remove pontos de milhar
      .replace(',', '.'); // Substitui vírgula decimal por ponto
    cleanedTargetAmount = parseFloat(sanitizedString);
  } else if (typeof rawFormData.targetAmount === 'number') {
    cleanedTargetAmount = rawFormData.targetAmount;
  }
  // --- FIM DA CORREÇÃO ---

  const validatedFields = goalSchema.safeParse({
    ...rawFormData,
    targetAmount: cleanedTargetAmount, // Usa o valor limpo para validação
  });

  if (!validatedFields.success) {
    console.log('❌ createGoalAction - Validação falhou:', validatedFields.error);
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    console.log('✅ createGoalAction - Dados validados. Criando meta...');
    await GoalService.createGoal({
      ...validatedFields.data,
      userId: session.user.id, // Adiciona o userId para o caso de ser uma meta pessoal
    });
    console.log('✅ createGoalAction - Meta criada com sucesso.');
  } catch (error) {
    console.error('❌ createGoalAction - Erro ao criar meta:', error);
    return { error: 'Ocorreu um erro ao criar a caixinha.' };
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
