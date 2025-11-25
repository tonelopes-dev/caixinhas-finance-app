/**
 * Helpers para Server Actions
 * 
 * Funções auxiliares para verificar permissões em server actions
 * antes de executar operações críticas
 */

'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuthService } from '@/services/auth.service';
import { 
  hasFullAccess, 
  canCreateVaults, 
  canAccessPersonalWorkspace,
  canCreateOwnResources,
  getAccessInfo,
  type UserWithoutPassword 
} from '@/lib/access-control';

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  accessDenied?: boolean;
};

/**
 * Obtém o usuário autenticado com verificação de acesso
 * Retorna null se não autenticado ou se não encontrar o usuário
 */
export async function getAuthenticatedUser(): Promise<UserWithoutPassword | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  const user = await AuthService.getUserById(session.user.id);
  return user;
}

/**
 * Verifica se o usuário tem acesso completo antes de executar ação
 * Retorna o usuário se tiver acesso, ou um erro se não tiver
 */
export async function requireFullAccess(): Promise<ActionResult<UserWithoutPassword>> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      success: false,
      error: 'Você precisa estar autenticado para realizar esta ação.',
      accessDenied: true,
    };
  }

  if (!hasFullAccess(user)) {
    const accessInfo = getAccessInfo(user);
    return {
      success: false,
      error: 'Seu acesso está restrito. Assine um plano para continuar usando todas as funcionalidades.',
      accessDenied: true,
    };
  }

  return {
    success: true,
    data: user,
  };
}

/**
 * Verifica se o usuário pode criar cofres
 */
export async function requireVaultCreationAccess(): Promise<ActionResult<UserWithoutPassword>> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      success: false,
      error: 'Você precisa estar autenticado para criar cofres.',
      accessDenied: true,
    };
  }

  if (!canCreateVaults(user)) {
    return {
      success: false,
      error: 'Você precisa de uma assinatura ativa para criar novos cofres.',
      accessDenied: true,
    };
  }

  return {
    success: true,
    data: user,
  };
}

/**
 * Verifica se o usuário pode criar recursos próprios (contas, caixinhas, etc)
 */
export async function requireOwnResourceCreation(): Promise<ActionResult<UserWithoutPassword>> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      success: false,
      error: 'Você precisa estar autenticado.',
      accessDenied: true,
    };
  }

  if (!canCreateOwnResources(user)) {
    return {
      success: false,
      error: 'Você precisa de uma assinatura ativa para criar novos recursos.',
      accessDenied: true,
    };
  }

  return {
    success: true,
    data: user,
  };
}

/**
 * Verifica se o usuário pode acessar workspace pessoal
 */
export async function requirePersonalWorkspaceAccess(): Promise<ActionResult<UserWithoutPassword>> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      success: false,
      error: 'Você precisa estar autenticado.',
      accessDenied: true,
    };
  }

  if (!canAccessPersonalWorkspace(user)) {
    return {
      success: false,
      error: 'Você não pode acessar seu espaço pessoal com acesso expirado. Assine um plano para continuar.',
      accessDenied: true,
    };
  }

  return {
    success: true,
    data: user,
  };
}

/**
 * Wrapper genérico para proteger server actions
 * Executa a função apenas se o usuário tiver acesso completo
 */
export async function withFullAccess<T>(
  action: (user: UserWithoutPassword) => Promise<ActionResult<T>>
): Promise<ActionResult<T>> {
  const accessCheck = await requireFullAccess();

  if (!accessCheck.success || !accessCheck.data) {
    return {
      success: false,
      error: accessCheck.error,
      accessDenied: accessCheck.accessDenied,
    };
  }

  return await action(accessCheck.data);
}
