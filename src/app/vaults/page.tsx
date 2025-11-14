import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserVaultsData } from './actions';
import { VaultsPageClient } from '@/components/vaults';

export default async function VaultSelectionPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;

  const data = await getUserVaultsData(userId);

  if (!data) {
    redirect('/login');
  }

  return <VaultsPageClient {...data} />;
}
