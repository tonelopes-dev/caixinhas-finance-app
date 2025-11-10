import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getUserVaultsData } from './actions';
import { VaultsPageClient } from '@/components/vaults';

export default async function VaultSelectionPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('CAIXINHAS_USER_ID')?.value;

  if (!userId) {
    redirect('/login');
  }

  const data = await getUserVaultsData(userId);

  if (!data) {
    redirect('/login');
  }

  return <VaultsPageClient {...data} />;
}
