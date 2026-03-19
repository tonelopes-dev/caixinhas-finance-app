'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getProfileData } from './actions';
import { Button } from '@/components/ui/button';
import { ProfileForm } from '@/components/profile/profile-form';
import { ThemeCustomization } from '@/components/profile/theme-customization';
import { useLoading } from '@/components/providers/loading-provider';
import { GuestsManagement } from '@/components/profile/guests-management';
import { NotificationsManagement } from '@/components/profile/notifications-management';
import { VaultSettings } from '@/components/profile/vault-settings';
import { PasswordManagement } from '@/components/profile/password-management';
import type { User, Vault } from '@/lib/definitions';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DashboardBackground } from '@/components/dashboard/dashboard-background';
import { StandardBackButton } from '@/components/ui/standard-back-button';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User as UserIcon, Paintbrush, Lock, Bell, Users } from 'lucide-react';

type ProfileData = {
  currentUser: User;
  currentVault: Vault | null;
  hasVaults: boolean;
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showLoading, hideLoading } = useLoading();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }
    if (!session?.user) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      showLoading('Carregando Perfil...');
      const data = await getProfileData(session.user.id);
      if (!data?.currentUser) {
        router.push('/login');
      } else {
        setProfileData(data as ProfileData);
      }
      hideLoading();
    };

    fetchData();
  }, [session, status, router, showLoading, hideLoading]);

  const refreshProfileData = useCallback(async () => {
    if (session?.user) {
      const data = await getProfileData(session.user.id);
      if (data?.currentUser) {
        setProfileData(data as ProfileData);
      }
    }
  }, [session]);

  if (!profileData) {
    return null; // O LoadingProvider global já está mostrando a tela de loading
  }
  
  const { currentUser, currentVault } = profileData;
  const isPersonalVault = !currentVault || currentVault.id === currentUser.id;

  return (
    <div className="relative min-h-screen flex-1 flex-col flex overflow-hidden">
      <DashboardBackground />
      
      <div className="relative z-10 mx-auto w-full max-w-6xl p-4 md:p-10 pt-24 md:pt-32 pb-32">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-12"
        >
          <StandardBackButton href="/dashboard" label="Voltar para o Dashboard" />
          
          <div className="flex flex-col gap-1 mb-6">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff6b7b] ml-1">Configurações</p>
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-[#2D241E] italic">
              Meu <span className="text-[#ff6b7b] uppercase">Perfil</span>
            </h1>
          </div>
          <p className="text-sm font-medium text-[#2D241E]/50 italic ml-1">
            Mantenha seu porto seguro financeiro sempre atualizado.
          </p>
        </motion.div>
        
        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="flex flex-wrap md:flex-nowrap w-full h-auto p-2 bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 mb-10 gap-2 shadow-xl shadow-[#2D241E]/5">
            <TabsTrigger 
              value="geral" 
              className="flex-1 min-w-[120px] h-14 rounded-2xl data-[state=active]:bg-white data-[state=active]:text-[#ff6b7b] data-[state=active]:shadow-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 gap-2"
            >
              <UserIcon className="h-4 w-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger 
              value="aparencia"
              className="flex-1 min-w-[120px] h-14 rounded-2xl data-[state=active]:bg-white data-[state=active]:text-[#ff6b7b] data-[state=active]:shadow-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 gap-2"
            >
              <Paintbrush className="h-4 w-4" />
              Aparência
            </TabsTrigger>
            <TabsTrigger 
              value="seguranca"
              className="flex-1 min-w-[120px] h-14 rounded-2xl data-[state=active]:bg-white data-[state=active]:text-[#ff6b7b] data-[state=active]:shadow-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 gap-2"
            >
              <Lock className="h-4 w-4" />
              Segurança
            </TabsTrigger>
            <TabsTrigger 
              value="notificacoes"
              className="flex-1 min-w-[120px] h-14 rounded-2xl data-[state=active]:bg-white data-[state=active]:text-[#ff6b7b] data-[state=active]:shadow-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 gap-2"
            >
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
            {!isPersonalVault && (
              <TabsTrigger 
                value="cofre"
                className="flex-1 min-w-[120px] h-14 rounded-2xl data-[state=active]:bg-white data-[state=active]:text-[#ff6b7b] data-[state=active]:shadow-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 gap-2"
              >
                <Users className="h-4 w-4" />
                Cofre & Equipe
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="geral" className="focus-visible:ring-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <ProfileForm user={currentUser} onProfileUpdate={refreshProfileData} />
            </motion.div>
          </TabsContent>
          
          <TabsContent value="aparencia" className="focus-visible:ring-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <ThemeCustomization />
            </motion.div>
          </TabsContent>
          
          <TabsContent value="seguranca" className="focus-visible:ring-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <PasswordManagement currentUser={currentUser} />
            </motion.div>
          </TabsContent>
          
          <TabsContent value="notificacoes" className="focus-visible:ring-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <NotificationsManagement />
            </motion.div>
          </TabsContent>
          
          {!isPersonalVault && currentVault && (
            <TabsContent value="cofre" className="focus-visible:ring-0 space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <GuestsManagement
                  members={currentVault.members}
                  vaultOwnerId={currentVault.ownerId}
                  currentUserId={currentUser.id}
                  vaultId={currentVault.id}
                  currentUser={currentUser}
                />
                
                <VaultSettings
                  vaultId={currentVault.id}
                  vaultName={currentVault.name}
                  isOwner={currentVault.ownerId === currentUser.id}
                />
              </motion.div>
            </TabsContent>
          )}
        </Tabs>
        
        {isPersonalVault && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 rounded-[32px] bg-white/20 backdrop-blur-xl border border-white/40 p-10 text-center shadow-xl shadow-[#2D241E]/5"
          >
            <div className="max-w-md mx-auto">
              <div className="bg-[#ff6b7b]/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-[#ff6b7b]" />
              </div>
              <h3 className="text-xl font-headline font-bold text-[#2D241E] italic mb-2">Compartilhamento</h3>
              <p className="mb-8 text-sm font-medium text-[#2D241E]/50 italic leading-relaxed">
                Você está em um cofre pessoal. Para convidar outras pessoas e gerenciar uma equipe, acesse seus convites ou crie um novo cofre compartilhado.
              </p>
              <Button asChild variant="outline" className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] border-[#2D241E]/10 hover:bg-white hover:text-[#ff6b7b] transition-all">
                <Link href="/invite" onClick={() => showLoading('Abrindo Convites...')}>
                  Ver meus Convites
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
