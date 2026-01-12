import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { InvitationsPageClient } from '@/components/invitations/invitations-page-client';
import { VaultService } from '@/services/vault.service';

export const metadata = {
  title: 'Convites Pendentes | Caixinhas',
  description: 'Gerencie seus convites para cofres e caixinhas',
};

export default async function InvitationsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  // Buscar convites pendentes do banco de dados
  const invitations = await VaultService.getPendingInvitations(session.user.id);

  return <InvitationsPageClient initialInvitations={invitations} />;
}
