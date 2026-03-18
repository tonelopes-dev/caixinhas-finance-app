import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserVaultsData } from './actions';
import { VaultsPageClient } from '@/components/vaults';
import { AuthService } from '@/services/auth.service';
import { getAccessInfo } from '@/lib/access-control';
import { AccessBanner } from '@/components/ui/access-banner';
import { cache } from 'react';

const getCachedUserVaultsData = async (userId: string) => {
  console.time('🔍 Vaults: Loading user data');
  const data = await getUserVaultsData(userId);
  console.timeEnd('🔍 Vaults: Loading user data');
  return data;
};

const getCachedUserById = async (userId: string) => {
  console.time('🔍 Vaults: Loading user profile');
  const user = await AuthService.getUserById(userId);
  console.timeEnd('🔍 Vaults: Loading user profile');
  return user;
};

export default async function VaultSelectionPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;
  
  // ⚡ PARALLEL FETCHING: Executa queries em paralelo com cache
  const [data, user] = await Promise.all([
    getCachedUserVaultsData(userId),
    getCachedUserById(userId),
  ]);

  if (!data || !user || !data.currentUser || !data.userVaults || !data.userInvitations) {
    // Se não encontrar o usuário no banco, desloga por segurança
    redirect('/login?error=user_not_found');
  }

  // Usa o sistema centralizado de controle de acesso
  const accessInfo = getAccessInfo(user);

  // Verificar o workspace atual do cookie
  const cookieStore = await import('next/headers').then(m => m.cookies());
  const cookies = await cookieStore;
  const vaultId = cookies.get('CAIXINHAS_VAULT_ID')?.value;
  
  // Se há um vaultId no cookie e o usuário é membro, esse é o workspace ativo
  let currentWorkspaceId = userId; // Padrão é o workspace pessoal
  if (vaultId) {
    const { VaultService } = await import('@/services/vault.service');
    const isMember = await VaultService.isMember(vaultId, userId);
    if (isMember) {
      currentWorkspaceId = vaultId;
    }
  }

  return (
    <VaultsPageClient 
      currentUser={{
        ...data.currentUser,
        avatarUrl: data.currentUser.avatarUrl || null,
        workspaceImageUrl: data.currentUser.workspaceImageUrl || null
      }}
      userVaults={data.userVaults.map(vault => ({
        ...vault,
        members: vault.members.map(member => ({
          id: member.id,
          name: member.name,
          email: member.email,
          avatarUrl: member.avatarUrl,
          workspaceImageUrl: null,
          subscriptionStatus: member.subscriptionStatus as 'active' | 'inactive' | 'trial'
        }))
      }))}
      userInvitations={data.userInvitations}
      canCreateVaults={accessInfo.canCreateVaults}
      canAccessPersonal={accessInfo.canAccessPersonalWorkspace}
      currentWorkspaceId={currentWorkspaceId}
      accessInfo={accessInfo}
    />
  );
}
