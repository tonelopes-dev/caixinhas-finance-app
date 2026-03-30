import { InvitationLanding } from '@/components/auth/invitation-landing';
import { authOptions } from '@/lib/auth';
import { VaultService } from '@/services/vault.service';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';

interface InvitationPageProps {
  params: {
    id: string;
  };
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { id } = params;
  
  // Buscar detalhes do convite
  const invitation = await VaultService.getInvitationById(id);
  
  if (!invitation) {
    notFound();
  }

  // Se o convite não estiver pendente, redirecionar para o dashboard
  if (invitation.status !== 'pending') {
    redirect('/invitations');
  }

  // Verificar se o usuário já está logado
  // @ts-expect-error - pendencia estrutural a ser revisada
  const session = await getServerSession(authOptions);
  
  // Se já estiver logado e for o destinatário correto (ou convite por e-mail generico), 
  // sugerimos ir direto para as notificações, mas a landing page ainda é útil para contexto.
  // No entanto, se o usuário logado for DIFERENTE do receiverId (se houver um), 
  // a landing page deve avisar ou o sistema de aceite tratará isso.

  return <InvitationLanding invitation={invitation} />;
}
