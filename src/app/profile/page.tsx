
'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getMockDataForUser } from '@/lib/data';
import type { User, Vault } from '@/lib/definitions';

import { Button } from '@/components/ui/button';
import { ProfileForm } from '@/components/profile/profile-form';
import { GuestsManagement } from '@/components/profile/guests-management';
import { CategoriesManagement } from '@/components/profile/categories-management';
import { NotificationsManagement } from '@/components/profile/notifications-management';
import withAuth from '@/components/auth/with-auth';

function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentVault, setCurrentVault] = useState<Vault | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('CAIXINHAS_USER_ID');
    const vaultId = sessionStorage.getItem('CAIXINHAS_VAULT_ID');

    if (!userId || !vaultId) {
      router.push('/login');
      return;
    }

    const { currentUser, currentVault } = getMockDataForUser(userId, vaultId);
    setCurrentUser(currentUser);
    setCurrentVault(currentVault);

  }, [router]);

  if (!currentUser) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Se for um cofre pessoal, não há membros para gerenciar além de si mesmo.
  const isPersonalVault = currentVault === null || currentVault.id === currentUser.id;

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
            <ProfileForm />
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

export default withAuth(ProfilePage);
