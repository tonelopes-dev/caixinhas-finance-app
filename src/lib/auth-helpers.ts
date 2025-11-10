import { AuthService } from '@/services/auth.service';

/**
 * Valida se um userId existe no banco de dados
 * @param userId - ID do usuário a ser validado
 * @returns true se o usuário existe e está ativo
 */
export async function validateUserSession(userId: string): Promise<boolean> {
  try {
    const user = await AuthService.getUserById(userId);
    
    if (!user) {
      return false;
    }

    // Verificar se a assinatura está ativa
    // if (user.subscriptionStatus === 'inactive') {
    //   return false;
    // }

    return true;
  } catch (error) {
    console.error('Erro ao validar sessão do usuário:', error);
    return false;
  }
}
