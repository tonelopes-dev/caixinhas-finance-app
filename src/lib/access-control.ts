/**
 * Sistema Centralizado de Controle de Acesso
 * 
 * Este módulo implementa a lógica de verificação de acesso baseada no
 * status de assinatura dos usuários conforme documentado em:
 * docs/user-access-control.md
 * 
 * Regras:
 * - trial: Acesso total durante o período de teste (30 dias)
 * - active: Acesso total ilimitado (assinante pagante)
 * - inactive/expired: Acesso restrito (pode apenas aceitar convites e colaborar em cofres de outros)
 */

import type { UserWithoutPassword } from '@/services/auth.service';

export type { UserWithoutPassword };

export type AccessLevel = 'full' | 'restricted' | 'none';

export type SubscriptionStatus = 'active' | 'inactive' | 'trial';

/**
 * Verifica o status efetivo da assinatura do usuário
 * Considera trial expirado como inactive
 */
export function getEffectiveStatus(user: UserWithoutPassword): SubscriptionStatus {
  // Se já é active ou inactive, retorna direto
  if (user.subscriptionStatus === 'active') {
    return 'active';
  }
  
  if (user.subscriptionStatus === 'inactive') {
    return 'inactive';
  }

  // Se é trial, verifica se ainda está válido
  if (user.subscriptionStatus === 'trial') {
    if (!user.trialExpiresAt) {
      // Trial sem data de expiração - tratamos como trial válido por padrão
      // (para não bloquear usuários em migração ou casos especiais)
      console.warn(`⚠️ Usuário ${user.id} tem status trial mas sem data de expiração`);
      return 'trial';
    }

    const now = new Date();
    const expirationDate = new Date(user.trialExpiresAt);
    
    if (expirationDate > now) {
      // Trial ainda válido
      return 'trial';
    } else {
      // Trial expirado
      return 'inactive';
    }
  }

  // Fallback: qualquer outro status é tratado como inactive
  return 'inactive';
}

/**
 * Verifica se o usuário tem acesso completo ao sistema
 * (trial válido ou assinatura ativa)
 */
export function hasFullAccess(user: UserWithoutPassword): boolean {
  const status = getEffectiveStatus(user);
  return status === 'active' || status === 'trial';
}

/**
 * Verifica se o usuário pode criar recursos próprios
 * (cofres, caixinhas pessoais, contas, etc)
 */
export function canCreateOwnResources(user: UserWithoutPassword): boolean {
  return hasFullAccess(user);
}

/**
 * Verifica se o usuário pode acessar seu espaço pessoal
 * (workspace pessoal / "Minha Conta Pessoal")
 */
export function canAccessPersonalWorkspace(user: UserWithoutPassword): boolean {
  return hasFullAccess(user);
}

/**
 * Verifica se o usuário pode criar novos cofres compartilhados
 */
export function canCreateVaults(user: UserWithoutPassword): boolean {
  return hasFullAccess(user);
}

/**
 * Verifica se o usuário pode aceitar convites e colaborar em cofres de outros
 * Esta é uma funcionalidade permitida mesmo para usuários com acesso expirado
 */
export function canAcceptInvitations(user: UserWithoutPassword): boolean {
  // Todos os usuários podem aceitar convites, independente do status
  return true;
}

/**
 * Verifica se o usuário pode acessar um cofre específico
 * @param user - Usuário a verificar
 * @param vaultOwnerId - ID do dono do cofre
 * @param isUserMember - Se o usuário é membro do cofre
 */
export function canAccessVault(
  user: UserWithoutPassword,
  vaultOwnerId: string,
  isUserMember: boolean
): boolean {
  // Se o usuário não é membro, não pode acessar
  if (!isUserMember) {
    return false;
  }

  // Se o usuário é o dono do cofre, precisa ter acesso completo
  if (vaultOwnerId === user.id) {
    return hasFullAccess(user);
  }

  // Se é membro mas não é dono, pode acessar independente do seu status
  // (funcionalidade de colaboração para usuários com acesso expirado)
  return true;
}

/**
 * Verifica se o usuário pode criar/editar recursos dentro de um cofre
 * @param user - Usuário a verificar
 * @param vaultOwnerId - ID do dono do cofre
 */
export function canManageVaultResources(
  user: UserWithoutPassword,
  vaultOwnerId: string
): boolean {
  // Se o usuário é o dono do cofre, precisa ter acesso completo
  if (vaultOwnerId === user.id) {
    return hasFullAccess(user);
  }

  // Se é apenas membro, pode gerenciar recursos independente do seu status
  return true;
}

/**
 * Retorna informações sobre limitações de acesso do usuário
 */
export function getAccessInfo(user: UserWithoutPassword) {
  const status = getEffectiveStatus(user);
  const fullAccess = hasFullAccess(user);

  let daysRemaining = 0;
  if (status === 'trial' && user.trialExpiresAt) {
    const now = new Date();
    const expiration = new Date(user.trialExpiresAt);
    daysRemaining = Math.ceil((expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  return {
    status,
    fullAccess,
    isTrialActive: status === 'trial',
    isActive: status === 'active',
    isRestricted: !fullAccess,
    daysRemaining,
    canCreateVaults: canCreateVaults(user),
    canAccessPersonalWorkspace: canAccessPersonalWorkspace(user),
    canAcceptInvitations: canAcceptInvitations(user),
    message: getAccessMessage(status, daysRemaining),
  };
}

/**
 * Retorna mensagem apropriada baseada no status de acesso
 */
function getAccessMessage(status: SubscriptionStatus, daysRemaining: number): string {
  switch (status) {
    case 'active':
      return ''; // Não mostra mensagem para usuários ativos (vai exibir o PremiumBadge)
    case 'trial':
      return `Você está no período de teste. ${daysRemaining} ${daysRemaining === 1 ? 'dia restante' : 'dias restantes'}.`;
    case 'inactive':
      return 'Seu acesso expirou. Você pode continuar colaborando em cofres de outros usuários, mas não pode acessar seu espaço pessoal ou criar novos cofres.';
    default:
      return '';
  }
}

/**
 * Lista de rotas que requerem acesso completo
 */
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/accounts',
  '/transactions',
  '/goals',
  '/recurring',
  '/reports',
  '/patrimonio',
  '/profile',
  '/invite',
  '/vaults/new', // Criar novo cofre
] as const;

/**
 * Lista de rotas que são sempre acessíveis (mesmo com acesso expirado)
 */
export const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/terms',
  '/landing',
  '/auth',
  '/api',
] as const;

/**
 * Rotas que usuários com acesso restrito podem acessar
 */
export const RESTRICTED_ACCESS_ROUTES = [
  '/vaults', // Pode ver e aceitar convites
  '/invitations', // Pode gerenciar convites
  '/notifications', // Pode ver notificações
] as const;

/**
 * Verifica se uma rota requer acesso completo
 */
export function routeRequiresFullAccess(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Verifica se uma rota é pública
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Verifica se uma rota é acessível com acesso restrito
 */
export function isRestrictedAccessRoute(pathname: string): boolean {
  return RESTRICTED_ACCESS_ROUTES.some(route => pathname.startsWith(route));
}
