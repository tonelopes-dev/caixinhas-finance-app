"use server";

import { VaultService } from '@/services/vault.service';
import { AuthService } from '@/services/auth.service';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createVaultSchema = z.object({
  name: z.string().min(1, { message: 'O nome do cofre é obrigatório.' }),
  imageUrl: z.string().url().optional(),
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
