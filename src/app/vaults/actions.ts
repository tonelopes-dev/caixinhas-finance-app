"use server";

import { VaultService } from '@/services/vault.service';
import { AuthService } from '@/services/auth.service';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createVaultSchema = z.object({
  name: z.string().min(1, { message: 'O nome do cofre é obrigatório.' }),
  imageUrl: z.string().url().optional(),
  isPrivate: z.boolean().optional(),
});

const updateVaultSchema = z.object({
  vaultId: z.string().min(1),
  name: z.string().min(1, { message: 'O nome do cofre é obrigatório.' }),
  imageUrl: z.string().url().optional(),
  isPrivate: z.boolean().optional(),
});

export type VaultActionState = {
  message?: string | null;
  errors?: {
    name?: string[];
    imageUrl?: string[];
  };
};

/**
 * Busca dados do usuário e seus cofres
 * @param userId - ID do usuário
 * @returns Dados do usuário, cofres e convites
 */
export async function getUserVaultsData(userId: string) {
  try {
    const [user, vaults, invitations] = await Promise.all([
      AuthService.getUserById(userId),
      VaultService.getUserVaults(userId),
      VaultService.getPendingInvitations(userId),
    ]);

    if (!user) {
      return null;
    }

    // Transformar vaults para o formato esperado pela UI
    const formattedVaults = vaults.map((vault) => ({
      id: vault.id,
      name: vault.name,
      imageUrl: vault.imageUrl || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1080',
      isPrivate: vault.isPrivate,
      ownerId: vault.ownerId,
      members: vault.members.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        avatarUrl: member.user.avatarUrl || '',
        subscriptionStatus: 'active',
      })),
    }));

    // Transformar invitations para o formato esperado
    const formattedInvitations = invitations.map((inv) => ({
      id: inv.id,
      vaultId: inv.targetId,
      vaultName: inv.targetName,
      invitedBy: inv.sender.name,
      status: inv.status as 'pending' | 'accepted' | 'declined',
    }));

    return {
      currentUser: user,
      userVaults: formattedVaults,
      userInvitations: formattedInvitations,
    };
  } catch (error) {
    console.error('Erro ao buscar dados dos cofres:', error);
    return null;
  }
}

/**
 * Cria um novo cofre
 * @param prevState - Estado anterior
 * @param formData - Dados do formulário
 * @returns Estado atualizado
 */
export async function createVaultAction(
  prevState: VaultActionState,
  formData: FormData
): Promise<VaultActionState> {
  // Verifica se o usuário tem permissão para criar cofres
  const { requireVaultCreationAccess } = await import('@/lib/action-helpers');
  const accessCheck = await requireVaultCreationAccess();

  if (!accessCheck.success || !accessCheck.data) {
    return {
      message: accessCheck.error || 'Acesso negado',
      errors: {},
    };
  }

  const userId = accessCheck.data.id;

  const validatedFields = createVaultSchema.safeParse({
    name: formData.get('name'),
    imageUrl: formData.get('imageUrl') || undefined,
    isPrivate: formData.get('isPrivate') === 'on',
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Falha na validação. Por favor, verifique os campos.',
    };
  }

  try {
    const newVault = await VaultService.createVault({
      name: validatedFields.data.name,
      imageUrl: validatedFields.data.imageUrl,
      isPrivate: validatedFields.data.isPrivate,
      ownerId: userId,
    });

    // Automaticamente definir o novo cofre como workspace ativo
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    cookieStore.set('CAIXINHAS_VAULT_ID', newVault.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    });

    revalidatePath('/vaults');
    revalidatePath('/dashboard');
    revalidatePath('/profile');
    revalidatePath('/invite');
    
    return {
      message: 'Cofre criado com sucesso!',
    };
  } catch (error) {
    console.error('Erro ao criar cofre:', error);
    return {
      message: 'Erro ao criar cofre. Tente novamente.',
      errors: {},
    };
  }
}

/**
 * Atualiza um cofre existente
 * @param prevState - Estado anterior
 * @param formData - Dados do formulário
 * @returns Estado atualizado
 */
export async function updateVaultAction(
  prevState: VaultActionState,
  formData: FormData
): Promise<VaultActionState> {
  const validatedFields = updateVaultSchema.safeParse({
    vaultId: formData.get('vaultId'),
    name: formData.get('name'),
    imageUrl: formData.get('imageUrl') || undefined,
    isPrivate: formData.get('isPrivate') === 'on',
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Falha na validação. Por favor, verifique os campos.',
    };
  }

  try {
    // Verificar se o usuário é dono do cofre
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth');
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return { message: 'Não autorizado', errors: {} };
    }

    // Caso especial: Atualizar perfil do usuário (Conta Pessoal)
    if (validatedFields.data.vaultId === session.user.id) {
      await AuthService.updateProfile(session.user.id, {
        name: validatedFields.data.name,
        avatarUrl: validatedFields.data.imageUrl,
      });
      
      revalidatePath('/vaults');
      revalidatePath('/dashboard');
      revalidatePath('/profile');
      
      return {
        message: 'Perfil atualizado com sucesso!',
      };
    }

    const vault = await VaultService.getVaultById(validatedFields.data.vaultId);
    if (!vault) {
      return { message: 'Cofre não encontrado', errors: {} };
    }

    if (vault.ownerId !== session.user.id) {
      return { message: 'Você não tem permissão para editar este cofre', errors: {} };
    }

    await VaultService.updateVault(validatedFields.data.vaultId, {
      name: validatedFields.data.name,
      imageUrl: validatedFields.data.imageUrl,
      isPrivate: validatedFields.data.isPrivate,
    });

    revalidatePath('/vaults');
    revalidatePath('/dashboard');
    revalidatePath('/profile');
    
    return {
      message: 'Cofre atualizado com sucesso!',
    };
  } catch (error) {
    console.error('Erro ao atualizar cofre:', error);
    return {
      message: 'Erro ao atualizar cofre. Tente novamente.',
      errors: {},
    };
  }
}

/**
 * Aceita um convite de cofre
 * @param invitationId - ID do convite
 * @param userId - ID do usuário
 */
export async function acceptInvitationAction(
  invitationId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await VaultService.acceptInvitation(invitationId, userId);
    revalidatePath('/vaults');
    
    return {
      success: true,
      message: 'Convite aceito com sucesso!',
    };
  } catch (error) {
    console.error('Erro ao aceitar convite:', error);
    return {
      success: false,
      message: 'Erro ao aceitar convite. Tente novamente.',
    };
  }
}

/**
 * Recusa um convite de cofre
 * @param invitationId - ID do convite
 * @param userId - ID do usuário
 */
export async function declineInvitationAction(
  invitationId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await VaultService.declineInvitation(invitationId, userId);
    revalidatePath('/vaults');
    
    return {
      success: true,
      message: 'Convite recusado.',
    };
  } catch (error) {
    console.error('Erro ao recusar convite:', error);
    return {
      success: false,
      message: 'Erro ao recusar convite. Tente novamente.',
    };
  }
}

/**
 * Converte a conta pessoal em um cofre compartilhado
 * @param userId - ID do usuário
 */
export async function convertPersonalToSharedVaultAction(
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { AuthService } = await import('@/services/auth.service');
    const user = await AuthService.getUserById(userId);
    
    if (!user) {
      return { success: false, message: 'Usuário não encontrado.' };
    }

    // 1. Criar novo cofre
    const newVault = await VaultService.createVault({
      name: `Cofre de ${user.name.split(' ')[0]}`,
      imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      ownerId: userId,
    });

    // 2. Migrar dados
    const prisma = (await import('@/services/prisma')).default;
    
    await prisma.$transaction([
      // Migrar Contas
      prisma.account.updateMany({
        where: { ownerId: userId, vaultId: null },
        data: { vaultId: newVault.id, scope: newVault.id },
      }),
      // Migrar Transações
      prisma.transaction.updateMany({
        where: { userId: userId, vaultId: null },
        data: { vaultId: newVault.id },
      }),
      // Migrar Metas
      prisma.goal.updateMany({
        where: { userId: userId, vaultId: null },
        data: { vaultId: newVault.id },
      }),
    ]);

    revalidatePath('/vaults');
    revalidatePath('/dashboard');
    
    return {
      success: true,
      message: 'Conta pessoal convertida em cofre compartilhado com sucesso!',
    };
  } catch (error) {
    console.error('Erro ao converter conta:', error);
    return {
      success: false,
      message: 'Erro ao converter conta. Tente novamente.',
    };
  }
}

/**
 * Envia um convite para um cofre
 * @param vaultId - ID do cofre
 * @param email - E-mail do convidado
 */
export async function inviteToVaultAction(
  vaultId: string,
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth');
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return { success: false, message: 'Não autorizado' };
    }

    await VaultService.createInvitation(vaultId, session.user.id, email);
    
    revalidatePath('/vaults');
    
    return {
      success: true,
      message: 'Convite enviado com sucesso!',
    };
  } catch (error) {
    console.error('Erro ao enviar convite:', error);
    if (error instanceof Error) {
        return { success: false, message: error.message };
    }
    return {
      success: false,
      message: 'Erro ao enviar convite. Tente novamente.',
    };
  }
}

/**
 * Exclui um cofre
 * @param vaultId - ID do cofre
 */
export async function deleteVaultAction(vaultId: string): Promise<{ success: boolean; message: string }> {
  try {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth');
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return { success: false, message: 'Não autorizado' };
    }

    const vault = await VaultService.getVaultById(vaultId);
    if (!vault) {
      return { success: false, message: 'Cofre não encontrado' };
    }

    if (vault.ownerId !== session.user.id) {
      return { success: false, message: 'Você não tem permissão para excluir este cofre' };
    }

    await VaultService.deleteVault(vaultId);
    
    revalidatePath('/vaults');
    revalidatePath('/dashboard');
    
    return {
      success: true,
      message: 'Cofre excluído com sucesso!',
    };
  } catch (error) {
    console.error('Erro ao excluir cofre:', error);
    return {
      success: false,
      message: 'Erro ao excluir cofre. Tente novamente.',
    };
  }
}

/**
 * Remove um membro de um cofre
 * @param vaultId - ID do cofre
 * @param userId - ID do usuário a ser removido
 */
export async function removeMemberAction(
  vaultId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth');
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return { success: false, message: 'Não autorizado' };
    }

    const vault = await VaultService.getVaultById(vaultId);
    if (!vault) {
      return { success: false, message: 'Cofre não encontrado' };
    }

    // Apenas o dono pode remover membros (ou o próprio membro pode sair - lógica futura)
    if (vault.ownerId !== session.user.id) {
      return { success: false, message: 'Você não tem permissão para remover membros deste cofre' };
    }

    if (vault.ownerId === userId) {
        return { success: false, message: 'O proprietário não pode ser removido.' };
    }

    await VaultService.removeMember(vaultId, userId);
    
    revalidatePath('/vaults');
    
    return {
      success: true,
      message: 'Membro removido com sucesso!',
    };
  } catch (error) {
    console.error('Erro ao remover membro:', error);
    return {
      success: false,
      message: 'Erro ao remover membro. Tente novamente.',
    };
  }
}

/**
 * Busca convites pendentes de um cofre
 * @param vaultId - ID do cofre
 */
export async function getVaultPendingInvitationsAction(vaultId: string) {
  try {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth');
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return [];
    }

    // Verificar se o usuário é membro do cofre (ou dono) para ver os convites
    const isMember = await VaultService.isMember(vaultId, session.user.id);
    if (!isMember) {
      return [];
    }

    const invitations = await VaultService.getVaultPendingInvitations(vaultId);
    
    return invitations.map(inv => ({
      id: inv.id,
      email: inv.receiverEmail || 'Sem e-mail',
      invitedBy: inv.sender.name,
      createdAt: inv.createdAt, // Assumindo que createdAt existe no tipo retornado pelo prisma, se não, ajustar
      status: inv.status
    }));
  } catch (error) {
    console.error('Erro ao buscar convites do cofre:', error);
    return [];
  }
}

/**
 * Cancela um convite enviado
 * @param invitationId - ID do convite
 */
export async function cancelInvitationAction(invitationId: string): Promise<{ success: boolean; message: string }> {
  try {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth');
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return { success: false, message: 'Não autorizado' };
    }

    await VaultService.cancelInvitation(invitationId, session.user.id);
    
    revalidatePath('/vaults');
    
    return {
      success: true,
      message: 'Convite cancelado com sucesso!',
    };
  } catch (error) {
    console.error('Erro ao cancelar convite:', error);
    if (error instanceof Error) {
        return { success: false, message: error.message };
    }
    return {
      success: false,
      message: 'Erro ao cancelar convite.',
    };
  }
}
