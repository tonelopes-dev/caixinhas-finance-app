
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
