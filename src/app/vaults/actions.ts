"use server";

import { VaultService } from '@/services/vault.service';
import { AuthService } from '@/services/auth.service';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';


const createVaultSchema = z.object({
  name: z.string().min(1, { message: 'O nome do cofre é obrigatório.' }),
  imageUrl: z.string().url().optional().nullable(), // Permitir null
  isPrivate: z.boolean().optional(),
});

const updateVaultSchema = z.object({
  vaultId: z.string().min(1),
  name: z.string().min(1, { message: 'O nome é obrigatório.' }),
  imageUrl: z.string().url().optional().nullable(), // Permitir null
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

  const file = formData.get('imageFile') as File; // Obter o arquivo da FormData
  let imageUrl: string | undefined = formData.get('imageUrl') as string || undefined;

  console.log('🔍 Debug createVaultAction:', {
    hasFile: !!file,
    fileName: file?.name,
    fileSize: file?.size,
    imageUrl: imageUrl
  });

  // Se um arquivo foi enviado, fazer upload para o S3
  if (file && file.size > 0) {
    console.log('📤 Iniciando upload para S3...');
    try {
      const { uploadFileToS3 } = await import('@/lib/s3');
      imageUrl = await uploadFileToS3(file);
      console.log('✅ Upload S3 concluído:', imageUrl);
    } catch (error) {
      console.error('❌ Erro no upload S3:', error);
      return {
        errors: { imageUrl: ['Falha no upload da imagem. Tente novamente.'] }
      };
    }
  }

  const validatedFields = createVaultSchema.safeParse({
    name: formData.get('name'),
    imageUrl: imageUrl || null, // Usar a URL do S3 ou null
    isPrivate: formData.get('isPrivate') === 'on',
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Falha na validação.' };
  }

  try {
    // Converter null para undefined para compatibilidade com CreateVaultInput
    const sanitizedData = {
      ...validatedFields.data,
      imageUrl: validatedFields.data.imageUrl === null ? undefined : validatedFields.data.imageUrl,
      ownerId: userId
    };
    
    const newVault = await VaultService.createVault(sanitizedData);
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    cookieStore.set('CAIXINHAS_VAULT_ID', newVault.id, {
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

  const file = formData.get('imageFile') as File; // Obter o arquivo da FormData
  let imageUrl: string | null | undefined = formData.get('imageUrl') as string || null; // URL existente ou null
  const vaultId = formData.get('vaultId') as string;

  // Se o vaultId é igual ao userId, estamos editando a conta pessoal
  console.log('🔍 Debug - vaultId:', vaultId, 'userId:', userId, 'isEqual:', vaultId === userId);
  if (vaultId === userId) {
    console.log('✅ Redirecionando para updatePersonalWorkspaceAction');
    return await updatePersonalWorkspaceAction(prevState, formData);
  }

  const currentVault = await VaultService.getVaultById(vaultId); // Obter o cofre atual para verificar a imagem antiga

  // Lógica de upload e exclusão da imagem
  if (file && file.size > 0) {
    // Se um novo arquivo foi enviado, faça o upload
    try {
      const { uploadFileToS3, deleteFileFromS3 } = await import('@/lib/s3');
      imageUrl = await uploadFileToS3(file);
      // Se já existia uma imagem, exclua a antiga do S3
      if (currentVault?.imageUrl) {
        await deleteFileFromS3(currentVault.imageUrl);
      }
    } catch (uploadError) {
      console.error('Erro ao fazer upload da imagem para o S3:', uploadError);
      return { message: 'Erro ao fazer upload da nova imagem para o cofre.' };
    }
  } else if (imageUrl === null && currentVault?.imageUrl) {
    // Se a URL foi explicitamente definida como null (removida) e existia uma imagem antiga
    try {
      const { deleteFileFromS3 } = await import('@/lib/s3');
      await deleteFileFromS3(currentVault.imageUrl);
    } catch (deleteError) {
      console.error('Erro ao deletar imagem antiga do S3:', deleteError);
    }
  }
  // Se imageUrl for undefined (não houve mudança no campo) ou se a nova URL for a mesma da antiga, não fazer nada.

  const validatedFields = updateVaultSchema.safeParse({
    vaultId: vaultId,
    name: formData.get('name'),
    imageUrl: imageUrl,
    isPrivate: formData.get('isPrivate') === 'on',
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Falha na validação.' };
  }

  const { vaultId: validatedVaultId, ...updateData } = validatedFields.data;

  // Converter null para undefined para compatibilidade com UpdateVaultInput
  const sanitizedUpdateData = {
    ...updateData,
    imageUrl: updateData.imageUrl === null ? undefined : updateData.imageUrl
  };

  try {
    const vault = await VaultService.getVaultById(validatedVaultId);
    console.log('🔍 Debug updateVault - userId:', userId);
    console.log('🔍 Debug updateVault - vault:', vault ? { id: vault.id, name: vault.name, ownerId: vault.ownerId } : null);
    
    if (!vault || vault.ownerId !== userId) {
      console.log('❌ Permissão negada - vault.ownerId:', vault?.ownerId, 'userId:', userId);
      return { message: 'Você não tem permissão para editar este cofre' };
    }
    await VaultService.updateVault(validatedVaultId, sanitizedUpdateData);

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

export async function deleteVaultAction(vaultId: string): Promise<{ success: boolean; message: string }> {
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/lib/auth');
  const session = await getServerSession(authOptions);

  if (!session?.user) return { success: false, message: 'Não autorizado' };
  const userId = session.user.id;

  try {
    const vault = await VaultService.getVaultById(vaultId);
    if (!vault || vault.ownerId !== userId) {
      return { success: false, message: 'Você não tem permissão para excluir este cofre' };
    }
    
    // Deletar a imagem do S3 se existir
    if (vault.imageUrl) {
      try {
        const { deleteFileFromS3 } = await import('@/lib/s3');
        await deleteFileFromS3(vault.imageUrl);
      } catch (deleteError) {
        console.error('Erro ao deletar imagem do S3:', deleteError);
      }
    }

    await VaultService.deleteVault(vaultId);
    revalidatePath('/vaults');
    revalidatePath('/dashboard');
    revalidatePath('/profile');
    return { success: true, message: 'Cofre excluído com sucesso!' };
  } catch (error) {
    console.error('Erro ao excluir cofre:', error);
    return { success: false, message: 'Erro ao excluir cofre. Tente novamente.' };
  }
}

export async function removeMemberAction(
  vaultId: string,
  memberId: string
): Promise<{ success: boolean; message: string }> {
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/lib/auth');
  const session = await getServerSession(authOptions);

  if (!session?.user) return { success: false, message: 'Não autorizado' };
  const userId = session.user.id;

  try {
    const vault = await VaultService.getVaultById(vaultId);
    if (!vault || vault.ownerId !== userId) {
      return { success: false, message: 'Você não tem permissão para remover membros deste cofre' };
    }
    await VaultService.removeMember(vaultId, memberId);
    revalidatePath('/vaults');
    revalidatePath(`/vaults/${vaultId}/manage`);
    return { success: true, message: 'Membro removido com sucesso!' };
  } catch (error) {
    console.error('Erro ao remover membro:', error);
    return { success: false, message: 'Erro ao remover membro. Tente novamente.' };
  }
}

export async function inviteToVaultAction(
  vaultId: string,
  email: string
): Promise<{ success: boolean; message: string }> {
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/lib/auth');
  const session = await getServerSession(authOptions);

  if (!session?.user) return { success: false, message: 'Não autorizado' };
  const userId = session.user.id;

  try {
    const vault = await VaultService.getVaultById(vaultId);
    if (!vault || vault.ownerId !== userId) {
      return { success: false, message: 'Você não tem permissão para convidar para este cofre' };
    }
    await VaultService.createInvitation(vaultId, userId, email); // Usar createInvitation do VaultService
    revalidatePath(`/vaults/${vaultId}/manage`);
    return { success: true, message: 'Convite enviado com sucesso!' };
  } catch (error) {
    console.error('Erro ao enviar convite:', error);
    if (error instanceof Error) {
        return { success: false, message: error.message };
    }
    return { success: false, message: 'Erro ao enviar convite. Tente novamente.' };
  }
}

export async function getVaultPendingInvitationsAction(
  vaultId: string
): Promise<{ id: string; targetName: string; senderName: string; status: string }[]> {
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/lib/auth');
  const session = await getServerSession(authOptions);

  if (!session?.user) return [];
  const userId = session.user.id;

  try {
    const vault = await VaultService.getVaultById(vaultId);
    if (!vault || (vault.ownerId !== userId && !vault.members.some(member => member.userId === userId))) {
      // User must be owner or a member to see pending invitations
      return [];
    }
    const invitations = await VaultService.getVaultPendingInvitations(vaultId);
    return invitations.map(inv => ({
      id: inv.id,
      targetName: inv.targetName,
      senderName: inv.sender.name,
      status: inv.status,
    }));
  } catch (error) {
    console.error('Erro ao buscar convites pendentes do cofre:', error);
    return [];
  }
}

export async function cancelInvitationAction(
  invitationId: string,
  vaultId: string
): Promise<{ success: boolean; message: string }> {
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/lib/auth');
  const session = await getServerSession(authOptions);

  if (!session?.user) return { success: false, message: 'Não autorizado' };
  const userId = session.user.id;

  try {
    // A verificação de permissão foi movida para o VaultService.cancelInvitation
    await VaultService.cancelInvitation(invitationId, userId);
    revalidatePath(`/vaults/${vaultId}/manage`);
    return { success: true, message: 'Convite cancelado com sucesso!' };
  } catch (error) {
    console.error('Erro ao cancelar convite:', error);
    if (error instanceof Error) {
        return { success: false, message: error.message };
    }
    return { success: false, message: 'Erro ao cancelar convite. Tente novamente.' };
  }
}

/**
 * Atualiza o workspace pessoal (Minha Conta Pessoal)
 */
export async function updatePersonalWorkspaceAction(
  prevState: VaultActionState,
  formData: FormData
): Promise<VaultActionState> {
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/lib/auth');
  const session = await getServerSession(authOptions);

  if (!session?.user) return { message: 'Não autorizado' };
  const userId = session.user.id;

  const file = formData.get('imageFile') as File;
  let imageUrl: string | null | undefined = formData.get('imageUrl') as string || null;
  
  // Buscar o usuário atual para verificar a imagem antiga
  const currentUser = await AuthService.getUserById(userId);
  if (!currentUser) {
    return { message: 'Usuário não encontrado' };
  }

  // Lógica de upload e exclusão da imagem
  if (file && file.size > 0) {
    // Se um novo arquivo foi enviado, faça o upload
    try {
      const { uploadFileToS3, deleteFileFromS3 } = await import('@/lib/s3');
      imageUrl = await uploadFileToS3(file);
      // Se já existia uma imagem, exclua a antiga do S3
      if (currentUser.workspaceImageUrl) {
        await deleteFileFromS3(currentUser.workspaceImageUrl);
      }
    } catch (uploadError) {
      console.error('Erro ao fazer upload da imagem para o S3:', uploadError);
      return { message: 'Erro ao fazer upload da nova imagem.' };
    }
  } else if (imageUrl === null && currentUser.workspaceImageUrl) {
    // Se a URL foi explicitamente definida como null (removida) e existia uma imagem antiga
    try {
      const { deleteFileFromS3 } = await import('@/lib/s3');
      await deleteFileFromS3(currentUser.workspaceImageUrl);
    } catch (deleteError) {
      console.error('Erro ao deletar imagem antiga do S3:', deleteError);
    }
  }

  const updatePersonalWorkspaceSchema = z.object({
    name: z.string().min(1, { message: "Nome não pode estar vazio." }),
    imageUrl: z.string().nullable().optional(),
    isPrivate: z.boolean().optional(),
  });

  const validatedFields = updatePersonalWorkspaceSchema.safeParse({
    name: formData.get('name'),
    imageUrl: imageUrl,
    isPrivate: formData.get('isPrivate') === 'on',
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Falha na validação.' };
  }

  try {
    await AuthService.updateProfile(userId, {
      workspaceImageUrl: validatedFields.data.imageUrl ?? undefined,
    });

    revalidatePath('/vaults');
    revalidatePath('/dashboard');
    revalidatePath('/profile');
    
    return { message: 'Workspace pessoal atualizado com sucesso!' };
  } catch (error) {
    console.error('Erro ao atualizar workspace pessoal:', error);
    return { message: 'Erro ao atualizar workspace pessoal. Tente novamente.' };
  }
}
