import { withPageAccess } from '@/lib/page-access';
import { InvitationsPageClient } from '@/components/invitations/invitations-page-client';
import { VaultService } from '@/services/vault.service';

export const metadata = {
  title: 'Convites Pendentes | Caixinhas',
  description: 'Gerencie seus convites para cofres e caixinhas',
};

export default async function InvitationsPage() {
  const { user } = await withPageAccess({ requireFullAccess: true });
  
  // Buscar convites pendentes do banco de dados
  const invitations = await VaultService.getPendingInvitations(user.id);

  return <InvitationsPageClient initialInvitations={invitations} />;
}
