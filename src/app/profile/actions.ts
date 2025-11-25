
'use server';

import { cookies } from 'next/headers';
import { AuthService } from '@/services/auth.service';
import { VaultService } from '@/services/vault.service';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Busca os dados necessários para a página de perfil
 * @param userId - ID do usuário autenticado
 * @returns Dados do usuário e do cofre atual, se houver
 */
export async function getProfileData(userId: string) {
  try {
    const cookieStore = await cookies();
    const vaultId = cookieStore.get('CAIXINHAS_VAULT_ID')?.value;
    
    const [currentUser, currentVault] = await Promise.all([
      AuthService.getUserById(userId),
      vaultId && vaultId !== userId ? VaultService.getVaultById(vaultId) : null,
    ]);

    if (!currentUser) {
      return null;
    }

    return {
      currentUser,
      currentVault,
    };
  } catch (error) {
    console.error('Erro ao buscar dados do perfil:', error);
    return null;
  }
}

const updateProfileSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
});

export type ProfileActionState = {
  message?: string | null;
  errors?: {
    name?: string[];
  };
};

/**
 * Server Action para atualizar o perfil do usuário
 */
export async function updateProfileAction(prevState: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { message: "Usuário não autenticado." };
  }

  const validatedFields = updateProfileSchema.safeParse({
    name: formData.get('name'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Falha na validação.',
    };
  }

  try {
    await AuthService.updateProfile(session.user.id, {
      name: validatedFields.data.name,
    });
    
    revalidatePath('/profile');
    revalidatePath('/', 'layout'); // Revalida o layout para atualizar o nome no header

    return { message: 'Perfil atualizado com sucesso!' };
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return { message: 'Ocorreu um erro ao atualizar o perfil.' };
  }
}

const inviteMemberSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  vaultId: z.string().min(1, { message: "ID do cofre não encontrado." }),
});

export type InviteMemberState = {
  message?: string | null;
  errors?: {
    email?: string[];
    vaultId?: string[];
  };
};

/**
 * Server Action para convidar um membro para o cofre
 */
export async function inviteMemberAction(prevState: InviteMemberState, formData: FormData): Promise<InviteMemberState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { message: "Usuário não autenticado." };
  }

  const validatedFields = inviteMemberSchema.safeParse({
    email: formData.get('email'),
    vaultId: formData.get('vaultId'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Falha na validação.',
    };
  }

  const { email, vaultId } = validatedFields.data;

  try {
    await VaultService.createInvitation(vaultId, session.user.id, email);
    
    revalidatePath('/profile');
    revalidatePath('/vaults');
    revalidatePath('/notifications');

    return { message: 'Convite enviado com sucesso!' };
  } catch (error: any) {
    console.error("Erro ao enviar convite:", error);
    
    if (error.message.includes('já é membro')) {
      return { 
        message: 'Este usuário já faz parte deste cofre.',
        errors: { email: ['Este e-mail já pertence a um membro do cofre'] }
      };
    }
    
    if (error.message.includes('convite pendente')) {
      return { 
        message: 'Já existe um convite pendente para este usuário.',
        errors: { email: ['Convite já enviado anteriormente'] }
      };
    }
    
    if (error.message.includes('não encontrado')) {
      return { 
        message: 'Usuário não encontrado. Peça para ele(a) se cadastrar primeiro.',
        errors: { email: ['E-mail não cadastrado no sistema'] }
      };
    }
    
    return { message: error.message || 'Ocorreu um erro ao enviar o convite.' };
  }
}

/**
 * Server Action para remover um membro do cofre
 */
export async function removeMemberAction(vaultId: string, userId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "Usuário não autenticado." };
  }

  try {
    // Verificar se o usuário atual é o dono do cofre
    const vault = await VaultService.getVaultById(vaultId);
    if (!vault || vault.ownerId !== session.user.id) {
      return { success: false, message: "Apenas o proprietário pode remover membros." };
    }

    // Não permitir remover o próprio dono
    if (userId === vault.ownerId) {
      return { success: false, message: "O proprietário não pode ser removido do cofre." };
    }

    await VaultService.removeMember(vaultId, userId);
    
    revalidatePath('/profile');
    revalidatePath('/vaults');

    return { success: true, message: 'Membro removido com sucesso!' };
  } catch (error: any) {
    console.error("Erro ao remover membro:", error);
    return { success: false, message: error.message || 'Ocorreu um erro ao remover o membro.' };
  }
}
