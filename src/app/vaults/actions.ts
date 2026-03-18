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
  console.log(`📡 [getUserVaultsData] Buscando dados para o usuário: ${userId}`);
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
      sender: inv.sender,
      vault: inv.vault,
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

  const file = formData.get('imageFile') as File;
  let imageUrl: string | undefined = formData.get('imageUrl') as string || undefined;

  // 1. Validar campos ANTES do upload
  const validatedFields = createVaultSchema.safeParse({
    name: formData.get('name') as string,
    imageUrl: imageUrl || null,
    isPrivate: formData.get('isPrivate') === 'true',
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Falha na validação.' };
  }

  // 2. Upload apenas se a validação inicial passar
  let uploadedBlobUrl: string | null = null;
  if (file && file.size > 0) {
    console.log('📤 [createVaultAction] Iniciando upload para Vercel Blob...');
    try {
      const { uploadFile } = await import('@/lib/blob');
      uploadedBlobUrl = await uploadFile(file);
      imageUrl = uploadedBlobUrl;
      console.log('✅ [createVaultAction] Upload Blob concluído:', imageUrl);
    } catch (error) {
      console.error('❌ [createVaultAction] Erro no upload Blob:', error);
      return {
        errors: { imageUrl: ['Falha no upload da imagem. Tente novamente.'] }
      };
    }
  }

  try {
    const sanitizedData = {
      ...validatedFields.data,
      imageUrl: imageUrl === null ? undefined : imageUrl,
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
    revalidatePath('/', 'layout');
    return { message: 'Cofre criado com sucesso!' };
  } catch (error) {
    console.error('❌ [createVaultAction] Erro ao criar cofre no Banco:', error);
    // 3. LIMPEZA: Se falhou ao salvar no banco, apagar o arquivo recém-subido
    if (uploadedBlobUrl) {
      const { deleteFile } = await import('@/lib/blob');
      await deleteFile(uploadedBlobUrl);
    }
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

  const file = formData.get('imageFile') as File;
  let imageUrl: string | null | undefined = formData.get('imageUrl') as string || null;
  const vaultId = formData.get('vaultId') as string;

  if (vaultId === userId) {
    return await updatePersonalWorkspaceAction(prevState, formData);
  }

  // 1. Validar campos básicos antes de qualquer upload
  const validatedFields = updateVaultSchema.safeParse({
    vaultId: vaultId,
    name: formData.get('name'),
    imageUrl: imageUrl,
    isPrivate: formData.get('isPrivate') === 'on',
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Falha na validação.' };
  }

  const currentVault = await VaultService.getVaultById(vaultId);
  if (!currentVault || currentVault.ownerId !== userId) {
    return { message: 'Você não tem permissão para editar este cofre' };
  }

  let uploadedBlobUrl: string | null = null;
  // 2. Lógica de upload atômica
  if (file && file.size > 0) {
    try {
      const { uploadFile, deleteFile } = await import('@/lib/blob');
      uploadedBlobUrl = await uploadFile(file);
      imageUrl = uploadedBlobUrl;
    } catch (uploadError) {
      console.error('❌ [updateVaultAction] Erro no upload:', uploadError);
      return { message: 'Erro ao fazer upload da nova imagem.' };
    }
  }

  try {
    const { vaultId: validatedVaultId, ...updateData } = validatedFields.data;
    const sanitizedUpdateData = {
      ...updateData,
      imageUrl: imageUrl === null ? undefined : imageUrl
    };

    await VaultService.updateVault(validatedVaultId, sanitizedUpdateData);

    // 3. LIMPEZA: Sucesso no Banco -> Se subiu uma nova, apagar a antiga
    if (uploadedBlobUrl && currentVault.imageUrl) {
      const { deleteFile } = await import('@/lib/blob');
      await deleteFile(currentVault.imageUrl);
    } 
    // Se a imagem foi removida explicitamente (imageUrl === null)
    else if (imageUrl === null && currentVault.imageUrl) {
      const { deleteFile } = await import('@/lib/blob');
      await deleteFile(currentVault.imageUrl);
    }

    revalidatePath('/vaults');
    revalidatePath('/dashboard');
    revalidatePath('/profile');
    revalidatePath('/', 'layout');
    
    return { message: 'Cofre atualizado com sucesso!' };
  } catch (error) {
    console.error('❌ [updateVaultAction] Erro ao salvar no Banco:', error);
    // 4. LIMPEZA: Falha no Banco -> Apagar o que acabamos de subir
    if (uploadedBlobUrl) {
      const { deleteFile } = await import('@/lib/blob');
      await deleteFile(uploadedBlobUrl);
    }
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
    revalidatePath('/dashboard');
    revalidatePath('/', 'layout');
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
    
    // Deletar a imagem do Blob se existir
    if (vault.imageUrl) {
      try {
        const { deleteFile } = await import('@/lib/blob');
        await deleteFile(vault.imageUrl);
      } catch (deleteError) {
        console.error('Erro ao deletar imagem do Blob:', deleteError);
      }
    }

    await VaultService.deleteVault(vaultId);
    console.log(`🗑️ [deleteVaultAction] Cofre ${vaultId} removido do banco.`);
    
    revalidatePath('/vaults');
    revalidatePath('/vaults', 'page');
    revalidatePath('/dashboard');
    revalidatePath('/profile');
    revalidatePath('/', 'layout');
    
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
    if (!vault) {
      return { success: false, message: 'Cofre não encontrado' };
    }
    
    // Verificar se o usuário é o dono do vault OU se é um membro com role 'owner'
    const isOwner = vault.ownerId === userId;
    const isOwnerMember = vault.members.some(m => m.userId === userId && m.role === 'owner');
    
    if (!isOwner && !isOwnerMember) {
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

export async function inviteToVaultWithContext(
  vaultId: string,
  email: string,
  goalName: string
): Promise<{ success: boolean; message: string }> {
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/lib/auth');
  const session = await getServerSession(authOptions);

  if (!session?.user) return { success: false, message: 'Não autorizado' };
  const userId = session.user.id;

  try {
    const vault = await VaultService.getVaultById(vaultId);
    if (!vault) {
      return { success: false, message: 'Cofre não encontrado' };
    }
    
    // Verificar se o usuário é o dono do vault OU se é um membro com role 'owner'
    const isOwner = vault.ownerId === userId;
    const isOwnerMember = vault.members.some(m => m.userId === userId && m.role === 'owner');
    
    if (!isOwner && !isOwnerMember) {
      return { success: false, message: 'Você não tem permissão para convidar para este cofre' };
    }
    
    // Passar contexto de goalName para o template de email
    await VaultService.createInvitation(vaultId, userId, email, {
      source: 'goal',
      goalName
    });
    
    revalidatePath(`/vaults/${vaultId}/manage`);
    revalidatePath(`/goals`);
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
  
  const currentUser = await AuthService.getUserById(userId);
  if (!currentUser) return { message: 'Usuário não encontrado' };

  const validatedFields = z.object({
    name: z.string().min(1, { message: "Nome não pode estar vazio." }),
    imageUrl: z.string().nullable().optional(),
  }).safeParse({
    name: formData.get('name'),
    imageUrl: imageUrl,
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Falha na validação.' };
  }

  let uploadedBlobUrl: string | null = null;
  if (file && file.size > 0) {
    try {
      const { uploadFile } = await import('@/lib/blob');
      uploadedBlobUrl = await uploadFile(file);
      imageUrl = uploadedBlobUrl;
    } catch (uploadError) {
      console.error('❌ [updatePersonalWorkspaceAction] Erro no upload:', uploadError);
      return { message: 'Erro ao fazer upload da nova imagem.' };
    }
  }

  try {
    await AuthService.updateProfile(userId, {
      workspaceImageUrl: imageUrl ?? undefined,
    });

    if (uploadedBlobUrl && currentUser.workspaceImageUrl) {
      const { deleteFile } = await import('@/lib/blob');
      await deleteFile(currentUser.workspaceImageUrl);
    } else if (imageUrl === null && currentUser.workspaceImageUrl) {
      const { deleteFile } = await import('@/lib/blob');
      await deleteFile(currentUser.workspaceImageUrl);
    }

    revalidatePath('/vaults');
    revalidatePath('/dashboard');
    revalidatePath('/profile');
    
    return { message: 'Workspace pessoal atualizado!' };
  } catch (error) {
    console.error('❌ [updatePersonalWorkspaceAction] Erro no Banco:', error);
    if (uploadedBlobUrl) {
      const { deleteFile } = await import('@/lib/blob');
      await deleteFile(uploadedBlobUrl);
    }
    return { message: 'Erro ao atualizar. Tente novamente.' };
  }
}
