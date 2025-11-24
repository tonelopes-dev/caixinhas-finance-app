
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
  const vaultIdCookie = cookieStore.get('CAIXINHAS_VAULT_ID');
  const vaultId = vaultIdCookie?.value;

  let workspaceId = userId;
  if (vaultId) {
    const isMember = await VaultService.isMember(vaultId, userId);
    if (isMember) {
      workspaceId = vaultId;
    }
  }

  const data = await getGoalsPageData(userId, workspaceId);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Metas</h2>
      </div>
      <GoalsPageClient data={data} />
    </div>
  );
}
