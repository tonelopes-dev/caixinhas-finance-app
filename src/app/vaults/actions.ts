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
  name: z.string().min(1, { message: 'O nome é obrigatório.' }),
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

export async function getUserVaultsData(userId: string) {
  try {
    const [user, vaults, invitations] = await Promise.all([
      AuthService.getUserById(userId),
      VaultService.getUserVaults(userId),
      VaultService.getPendingInvitations(userId),
    ]);

    if (!user) return null;

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

export async function createVaultAction(
  prevState: VaultActionState,
  formData: FormData
): Promise<VaultActionState> {
  const { requireVaultCreationAccess } = await import('@/lib/action-helpers');
  const accessCheck = await requireVaultCreationAccess();

  if (!accessCheck.success || !accessCheck.data) {
    return { message: accessCheck.error || 'Acesso negado' };
  }
  const userId = accessCheck.data.id;

  const validatedFields = createVaultSchema.safeParse({
    name: formData.get('name'),
    imageUrl: formData.get('imageUrl') || undefined,
    isPrivate: formData.get('isPrivate') === 'on',
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Falha na validação.' };
  }

  try {
    const newVault = await VaultService.createVault({ ...validatedFields.data, ownerId: userId });
    const { cookies } = await import('next/headers');
    await cookies().set('CAIXINHAS_VAULT_ID', newVault.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    revalidatePath('/vaults');
    revalidatePath('/dashboard');
    return { message: 'Cofre criado com sucesso!' };
  } catch (error) {
    console.error('Erro ao criar cofre:', error);
    return { message: 'Erro ao criar cofre. Tente novamente.' };
  }
}

export async function updateVaultAction(
  prevState: VaultActionState,
  formData: FormData
): Promise<VaultActionState> {
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/lib/auth');
  const session = await getServerSession(authOptions);

  if (!session?.user) return { message: 'Não autorizado' };
  const userId = session.user.id;

  const validatedFields = updateVaultSchema.safeParse({
    vaultId: formData.get('vaultId'),
    name: formData.get('name'),
    imageUrl: formData.get('imageUrl') || undefined,
    isPrivate: formData.get('isPrivate') === 'on',
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Falha na validação.' };
  }

  const { vaultId, ...updateData } = validatedFields.data;

  try {
    const vault = await VaultService.getVaultById(vaultId);
    if (!vault || vault.ownerId !== userId) {
      return { message: 'Você não tem permissão para editar este cofre' };
    }
    await VaultService.updateVault(vaultId, updateData);

    revalidatePath('/vaults');
    revalidatePath('/dashboard');
    revalidatePath('/profile');
    
    return { message: 'Espaço de trabalho atualizado com sucesso!' };
  } catch (error) {
    console.error('Erro ao atualizar:', error);
    return { message: 'Erro ao atualizar. Tente novamente.' };
  }
}

export async function acceptInvitationAction(
  invitationId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await VaultService.acceptInvitation(invitationId, userId);
    revalidatePath('/vaults');
    return { success: true, message: 'Convite aceito com sucesso!' };
  } catch (error) {
    console.error('Erro ao aceitar convite:', error);
    return { success: false, message: 'Erro ao aceitar convite. Tente novamente.' };
  }
}

export async function declineInvitationAction(
  invitationId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await VaultService.declineInvitation(invitationId, userId);
    revalidatePath('/vaults');
    return { success: true, message: 'Convite recusado.' };
  } catch (error) {
    console.error('Erro ao recusar convite:', error);
    return { success: false, message: 'Erro ao recusar convite. Tente novamente.' };
  }
}
