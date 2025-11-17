
'use server';

import { cookies } from 'next/headers';
import { AuthService, VaultService } from '@/services';

/**
 * Busca os dados necessários para a página de perfil
 * @param userId - ID do usuário autenticado
 * @returns Dados do usuário e do cofre atual, se houver
 */
export async function getProfileData(userId: string) {
  try {
    const cookieStore = cookies();
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
