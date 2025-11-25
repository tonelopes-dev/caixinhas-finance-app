/**
 * HOC para Proteção de Páginas com Verificação de Acesso
 * 
 * Como o middleware do Next.js roda no Edge Runtime e não pode fazer
 * queries ao banco, a verificação completa de acesso é feita aqui,
 * nas páginas individuais.
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuthService } from '@/services/auth.service';
import { hasFullAccess, getAccessInfo } from '@/lib/access-control';
import type { UserWithoutPassword } from '@/services/auth.service';

export type PageAccessConfig = {
  requireFullAccess?: boolean;
  redirectTo?: string;
};

/**
 * Verifica o acesso do usuário e retorna suas informações
 * ou redireciona se não tiver permissão
 */
export async function checkPageAccess(
  config: PageAccessConfig = {}
): Promise<{
  user: UserWithoutPassword;
  accessInfo: ReturnType<typeof getAccessInfo>;
}> {
  const { requireFullAccess: needsFullAccess = true, redirectTo = '/vaults' } = config;

  // Verifica se está autenticado
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Busca dados atualizados do usuário
  const user = await AuthService.getUserById(session.user.id);
  if (!user) {
    redirect('/login?error=user_not_found');
  }

  console.log('🔍 Page Access - User:', user.email);
  console.log('📊 Page Access - Subscription Status:', user.subscriptionStatus);
  console.log('📅 Page Access - Trial Expires:', user.trialExpiresAt);

  // Obtém informações de acesso
  const accessInfo = getAccessInfo(user);
  
  console.log('✅ Page Access - Access Info:', {
    status: accessInfo.status,
    fullAccess: accessInfo.fullAccess,
    isRestricted: accessInfo.isRestricted,
    daysRemaining: accessInfo.daysRemaining,
  });

  console.log('🔐 Page Access - Needs Full Access:', needsFullAccess);

  // Se a página requer acesso completo e o usuário não tem, redireciona
  if (needsFullAccess && !hasFullAccess(user)) {
    console.log('❌ Page Access - ACESSO NEGADO! Redirecionando para', redirectTo);
    const url = new URL(redirectTo, process.env.NEXTAUTH_URL || 'http://localhost:3000');
    url.searchParams.set('access', 'expired');
    redirect(url.toString());
  }

  console.log('✅ Page Access - ACESSO PERMITIDO!');
  return { user, accessInfo };
}

/**
 * Wrapper para verificação de acesso em páginas
 * Uso:
 * 
 * export default async function MyPage() {
 *   const { user, accessInfo } = await withPageAccess();
 *   // ... resto da página
 * }
 */
export async function withPageAccess(config?: PageAccessConfig) {
  return checkPageAccess(config);
}
