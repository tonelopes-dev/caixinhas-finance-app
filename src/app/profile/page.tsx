
'use server';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProfileData } from './actions';
import { Button } from '@/components/ui/button';
import { ProfileForm } from '@/components/profile/profile-form';
import { GuestsManagement } from '@/components/profile/guests-management';
import { CategoriesManagement } from '@/components/profile/categories-management';
import { NotificationsManagement } from '@/components/profile/notifications-management';
import type { User, Vault } from '@/lib/definitions';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const data = await getProfileData(session.user.id);

  if (!data?.currentUser) {
    redirect('/login');
  }

  const { currentUser, currentVault } = data;

  const isPersonalVault = !currentVault || currentVault.id === currentUser.id;

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-6xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Painel
          </Link>
        </Button>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-headline font-bold">Configurações</h2>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais, financeiras e de acesso.
            </p>
          </div>
          <div className="grid auto-rows-max grid-cols-1 items-start gap-8 lg:col-span-2">
            <ProfileForm user={currentUser} />
            <NotificationsManagement />
            <CategoriesManagement />
            {!isPersonalVault && currentVault && currentUser && (
              <GuestsManagement
                members={currentVault.members}
                vaultOwnerId={currentVault.ownerId}
                currentUserId={currentUser.id}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
