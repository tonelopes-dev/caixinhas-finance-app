'use server';

import { authOptions } from '@/lib/auth';
import { AccountService } from '@/services/account.service'; // Importado
import { GoalService } from '@/services/goal.service';
import prisma from '@/services/prisma';
import { TransactionService } from '@/services/transaction.service';
import { VaultService } from '@/services/vault.service';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

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
    // Remove "R$", espaços e qualquer caracter que não seja número, vírgula ou ponto
    const cleanValue = val.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(cleanValue);
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

const updateGoalSchema = goalSchema.extend({
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

export async function createGoalAction(_prevState: GoalFormState, formData: FormData): Promise<GoalFormState> {
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

export async function updateGoalAction(_prevState: GoalFormState, formData: FormData): Promise<GoalFormState> {
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

/**
 * Orquestra depósitos e retiradas de Caixinhas (Goals).
 * Cria uma transação do tipo 'transfer' vinculada à goal.
 * 
 * O TransactionService.createTransaction já lida com:
 * - Atualizar o saldo da conta bancária
 * - Atualizar o currentAmount da Goal
 * - Tudo dentro de uma $transaction atômica
 */
async function handleTransaction(formData: FormData, type: 'deposit' | 'withdraw'): Promise<TransactionFormState> {
    // 1. Autenticação
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) return { message: 'Usuário não autenticado' };

    // 2. Validação Zod
    const validatedFields = goalTransactionSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const { amount, goalId, accountId, description } = validatedFields.data;
    
    // 3. Buscar a caixinha para obter contexto (userId ou vaultId)
    const goal = await GoalService.getGoalById(goalId);
    if (!goal) {
        return { message: 'Caixinha não encontrada.' };
    }
    
    // 4. Validar saldo para retiradas
    if (type === 'withdraw' && goal.currentAmount < amount) {
        return { 
            message: `Saldo insuficiente na caixinha. Disponível: R$ ${goal.currentAmount.toFixed(2)}` 
        };
    }

    // 5. Chamar o serviço (atômico: cria transação + atualiza saldo da conta + atualiza goal)
    try {
        await TransactionService.createTransaction({
            userId: goal.userId || undefined,
            vaultId: goal.vaultId || undefined,
            amount,
            goalId,
            actorId: userId,
            type: 'transfer',
            date: new Date(),
            category: type === 'deposit' ? 'Depósito na Caixinha' : 'Retirada da Caixinha',
            description: description || (type === 'deposit' ? 'Depósito na Caixinha' : 'Retirada da Caixinha'),
            sourceAccountId: type === 'deposit' ? accountId : null,
            destinationAccountId: type === 'withdraw' ? accountId : null,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        console.error(`❌ Erro ao processar ${type}:`, error);
        return { message: `Não foi possível realizar o ${type === 'deposit' ? 'depósito' : 'a retirada'}: ${errorMessage}` };
    }

    // 6. Invalidar caches em cascata
    // - /goals e /goals/{id}: saldo da caixinha mudou
    // - /dashboard: saldos gerais e transações recentes mudaram
    // - /transactions: nova transação do tipo 'transfer' aparece na lista
    // - /accounts: saldo da conta bancária foi atualizado
    // - /reports e /recurring: dados derivados podem ter mudado
    revalidatePath('/', 'layout');
    revalidatePath('/goals');
    revalidatePath(`/goals/${goalId}`);
    revalidatePath('/dashboard');
    revalidatePath('/transactions');
    revalidatePath('/accounts');
    revalidatePath('/reports');
    revalidatePath('/recurring');

    const label = type === 'deposit' ? 'Depósito' : 'Retirada';
    return { success: true, message: `${label} realizado com sucesso!` };
}

export async function depositToGoalAction(_prevState: TransactionFormState, formData: FormData): Promise<TransactionFormState> {
    return handleTransaction(formData, 'deposit');
}

export async function withdrawFromGoalAction(_prevState: TransactionFormState, formData: FormData): Promise<TransactionFormState> {
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
  const userVaults = await VaultService.getUserVaults(userId);
  
  // Buscar convites pendentes relacionados ao cofre (quando a caixinha é de cofre)
  // Não mostramos convites específicos de goal porque o sistema atual não os suporta
  const pendingInvitations = goal.vaultId ? await prisma.invitation.findMany({
    where: {
      targetId: goal.vaultId,
      type: 'vault',
      status: 'pending',
    },
    include: {
      receiver: {
        select: {
          name: true,
          email: true,
          avatarUrl: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  }) : [];

  return { goal, currentVault, userVaults, pendingInvitations };
}

export async function getUserAllGoals(userId: string) {
  const personalGoals = await GoalService.getUserGoals(userId);
  const userVaults = await VaultService.getUserVaults(userId);
  const vaultGoalsPromises = userVaults.map(v => GoalService.getVaultGoals(v.id));
  const vaultGoals = (await Promise.all(vaultGoalsPromises)).flat();
  
  const allGoals = [...personalGoals, ...vaultGoals];
  
  // Garantir que não existam duplicatas por ID
  const uniqueGoals = Array.from(
    new Map(allGoals.map(goal => [goal.id, goal])).values()
  );
  
  return { goals: uniqueGoals };
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

export async function cancelGoalRelatedInvitation(invitationId: string, goalId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: 'Não autorizado' };
  }

  try {
    // Buscar o convite para verificar permissões
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      include: {
        vault: {
          select: { ownerId: true }
        }
      }
    });

    if (!invitation) {
      return { success: false, message: 'Convite não encontrado' };
    }

    // Verificar se o usuário é o dono do cofre ou quem enviou o convite
    const isOwner = invitation.vault?.ownerId === session.user.id;
    const isSender = invitation.senderId === session.user.id;

    if (!isOwner && !isSender) {
      return { success: false, message: 'Você não tem permissão para cancelar este convite' };
    }

    // Deletar o convite
    await prisma.invitation.delete({
      where: { id: invitationId }
    });

    revalidatePath(`/goals/${goalId}/manage`);
    revalidatePath('/invite');
    
    return { success: true, message: 'Convite cancelado com sucesso' };
  } catch (error) {
    console.error('Erro ao cancelar convite:', error);
    return { success: false, message: 'Erro ao cancelar convite' };
  }
}

export async function getUserVaultsAction() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Usuário não autenticado.");
  }
  try {
    const vaults = await VaultService.getUserVaults(session.user.id);
    return vaults.map(v => ({ id: v.id, name: v.name }));
  } catch (error) {
    console.error("Erro ao buscar cofres:", error);
    return [];
  }
}

export async function getCurrentVaultContextAction() {
  const cookieStore = await cookies();
  const vaultId = cookieStore.get('CAIXINHAS_VAULT_ID')?.value;
  return vaultId;
}
