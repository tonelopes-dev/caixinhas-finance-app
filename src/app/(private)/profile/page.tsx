import { redirect } from 'next/navigation';
import { withPageAccess } from '@/lib/page-access';
import { getProfileData } from './actions';
import { ProfilePageClient } from '@/components/profile/profile-page-client';
import { User, Vault } from '@/lib/definitions';

type ProfileData = {
  currentUser: User;
  currentVault: Vault | null;
  hasVaults: boolean;
};

export default async function ProfilePage() {
  const { user } = await withPageAccess({ requireFullAccess: true });
  const data = await getProfileData(user.id);
  
  if (!data?.currentUser) {
    redirect('/login');
  }

  return (
    <div className="pt-8">
      <ProfilePageClient initialData={data as ProfileData} />
    </div>
  );
}
