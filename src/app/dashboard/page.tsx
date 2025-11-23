
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { authOptions } from '@/lib/auth';
import { getDashboardData } from './actions';
import DashboardClient from '@/components/dashboard/dashboard-client';
import { VaultService } from '@/services/vault.service';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }
  
  const cookieStore = cookies();
  const userId = session.user.id;
  const vaultId = cookieStore.get('CAIXINHAS_VAULT_ID')?.value;

  let workspaceId: string;

  if (vaultId) {
    // Se um ID de cofre está no cookie, primeiro verificamos se o usuário realmente é membro.
    const isMember = await VaultService.isMember(vaultId, userId);
    
    if (isMember) {
      // Se for membro, o workspaceId é o ID do cofre.
      workspaceId = vaultId;
    } else {
      // Se não for membro, é um cookie inválido/antigo.
      // Ignoramos o cookie e usamos o workspace pessoal como padrão.
      workspaceId = userId;
    }
  } else {
    // Se não há cookie, o workspace é o pessoal.
    workspaceId = userId;
  }

  // Agora, buscamos os dados para o workspace determinado.
  const dashboardData = await getDashboardData(workspaceId, userId);

  // Também buscamos todos os cofres do usuário para o seletor de workspace.
  const userVaults = await VaultService.getUserVaults(userId);

  const workspaceName =
    workspaceId === userId
      ? session.user.name || 'Pessoal'
      : userVaults.find((v) => v.id === workspaceId)?.name || 'Cofre';

  return (
    <DashboardClient
      workspaceId={workspaceId}
      workspaceName={workspaceName}
      isVault={workspaceId !== userId}
      userVaults={userVaults}
      featuredGoals={dashboardData.featuredGoals}
      recentTransactions={dashboardData.recentTransactions}
      balanceSummary={dashboardData.balanceSummary}
      // A IA ainda não está implementada, então passamos um valor nulo.
      monthlySummary={null}
    />
  );
}
