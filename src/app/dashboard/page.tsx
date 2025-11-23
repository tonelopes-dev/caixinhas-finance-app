import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { authOptions } from '@/lib/auth';
import { getDashboardData } from './actions';
import DashboardClient from '@/components/dashboard/dashboard-client';
import { VaultService } from '@/services/vault.service';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const cookieStore = cookies();

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;
  const vaultId = cookieStore.get('CAIXINHAS_VAULT_ID')?.value;

  let workspaceId: string;

  if (vaultId) {
    // Se um ID de cofre está no cookie, primeiro verificamos se o usuário realmente é membro.
    // Isso evita erros caso o usuário tenha sido removido do cofre mas o cookie ainda exista.
    const isMember = await VaultService.isMember(vaultId, userId);
    
    if (isMember) {
      // Se for membro, o workspaceId é o ID do cofre.
      workspaceId = vaultId;
    } else {
      // Se não for membro, é um cookie inválido/antigo.
      // Limpamos o cookie e redirecionamos para a página de seleção para evitar um loop ou erro.
      cookieStore.delete('CAIXINHAS_VAULT_ID');
      redirect('/vaults');
    }
  } else {
    // Se não há cookie de cofre, o contexto é a conta pessoal do usuário.
    // O workspaceId, nesse caso, é o próprio ID do usuário.
    workspaceId = userId;
  }

  // Buscamos os dados do dashboard usando o workspaceId correto.
  const data = await getDashboardData(userId, workspaceId);

  if (!data) {
    // Se por algum motivo não for possível carregar os dados (ex: cofre deletado),
    // é mais seguro enviar o usuário para a seleção de workspace do que para o login.
    redirect('/vaults');
  }

  return <DashboardClient {...data as any} />;
}
