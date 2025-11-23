
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { authOptions } from '@/lib/auth';
import { GoalsPageClient } from '@/components/goals/goals-page-client';
import { getGoalsPageData } from './actions';
import { VaultService } from '@/services/vault.service';


export default async function GoalsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;
  const cookieStore = cookies();
  const vaultId = cookieStore.get('CAIXINHAS_VAULT_ID')?.value;

  let workspaceId = userId;
  if (vaultId) {
    const isMember = await VaultService.isMember(vaultId, userId);
    if (isMember) {
      workspaceId = vaultId;
    }
  }

  const data = await getGoalsPageData(userId, workspaceId);

  return (
    <GoalsPageClient 
      goals={data.goals} 
      vaults={data.vaults} 
      currentWorkspaceId={workspaceId}
    />
  );
}
