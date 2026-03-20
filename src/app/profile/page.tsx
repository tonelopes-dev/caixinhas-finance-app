import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getProfileData } from './actions';
import { ProfilePageClient } from '@/components/profile/profile-page-client';
import Header from '@/components/dashboard/header';
import { User, Vault } from '@/lib/definitions';

type ProfileData = {
  currentUser: User;
  currentVault: Vault | null;
  hasVaults: boolean;
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const data = await getProfileData(session.user.id);
  
  if (!data?.currentUser) {
    redirect('/login');
  }

  return (
    <>
      <Header user={session.user as User} partner={null} />
      <ProfilePageClient initialData={data as ProfileData} />
    </>
  );
}
