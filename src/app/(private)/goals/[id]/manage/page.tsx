
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
// CORRIGIDO: O caminho de importação foi ajustado para o nível correto.
import { getGoalManageData } from '../../actions';
import { ManageGoalClient } from '@/components/goals/manage-goal-client';
import { Vault } from '@/types';

export default async function ManageGoalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // No Next.js 15, params precisa ser aguardado
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const data = await getGoalManageData(id, session.user.id);

  if (!data || !data.goal) {
    notFound();
  }

  return (
    <ManageGoalClient
      goal={data.goal}
      currentUser={{
        ...session.user,
        subscriptionStatus: 'active',
        avatarUrl: session.user.avatarUrl || null,
        workspaceImageUrl: session.user.workspaceImageUrl || null
      }}
      currentVault={data.currentVault ? {
        ...data.currentVault,
        imageUrl: data.currentVault.imageUrl || '',
        members: data.currentVault.members.map(member => ({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          avatarUrl: member.user.avatarUrl,
          workspaceImageUrl: null,
          subscriptionStatus: 'active' as const
        }))
      } : null}
      userVaults={data.userVaults.map(vault => ({
        ...vault,
        imageUrl: vault.imageUrl || '',
        members: vault.members.map(member => ({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          avatarUrl: member.user.avatarUrl,
          workspaceImageUrl: null,
          subscriptionStatus: 'active' as const
        }))
      }))}
    />
  );
}
