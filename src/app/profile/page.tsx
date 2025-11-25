
'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getProfileData } from './actions';
import { Button } from '@/components/ui/button';
import { ProfileForm } from '@/components/profile/profile-form';
import { GuestsManagement } from '@/components/profile/guests-management';
import { NotificationsManagement } from '@/components/profile/notifications-management';
import type { User, Vault } from '@/lib/definitions';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type ProfileData = {
  currentUser: User;
  currentVault: Vault | null;
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }
    if (!session?.user) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      const data = await getProfileData(session.user.id);
      if (!data?.currentUser) {
        router.push('/login');
      } else {
        setProfileData(data as ProfileData);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [session, status, router]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        ease: 'easeOut',
        duration: 0.4,
      },
    },
  };

  if (isLoading || !profileData) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  
  const { currentUser, currentVault } = profileData;
  const isPersonalVault = !currentVault || currentVault.id === currentUser.id;

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mb-8"
        >
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o Painel
            </Link>
          </Button>
          <h1 className="text-3xl font-headline font-bold mb-2">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais, financeiras e de acesso.
          </p>
        </motion.div>
        
        <motion.div
          className="grid auto-rows-max grid-cols-1 items-start gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
            <motion.div variants={itemVariants}>
              <ProfileForm user={currentUser} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <NotificationsManagement />
            </motion.div>
            {!isPersonalVault && currentVault && currentUser && (
              <motion.div variants={itemVariants}>
                <GuestsManagement
                  members={currentVault.members}
                  vaultOwnerId={currentVault.ownerId}
                  currentUserId={currentUser.id}
                  vaultId={currentVault.id}
                  currentUser={currentUser}
                />
              </motion.div>
            )}
            {isPersonalVault && (
              <motion.div variants={itemVariants}>
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <p className="mb-2 text-sm text-muted-foreground">
                    Para convidar pessoas, você precisa estar em um cofre compartilhado.
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/invite">
                      Ir para Convites
                    </Link>
                  </Button>
                </div>
              </motion.div>
            )}
        </motion.div>
      </div>
    </div>
  );
}
