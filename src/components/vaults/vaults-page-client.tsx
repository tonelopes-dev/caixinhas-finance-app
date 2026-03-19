'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Check, 
  Mail, 
  Plus, 
  X, 
  MoreVertical, 
  Pencil, 
  Users, 
  Lock, 
  UserPlus,
  ChevronRight 
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
// ⚡ PERFORMANCE: Lazy-load heavy dialog components
const CreateVaultDialog = dynamic(
  () => import('@/components/vaults/create-vault-dialog').then(m => ({ default: m.CreateVaultDialog })),
  { ssr: false }
);
const EditVaultDialog = dynamic(
  () => import('@/components/vaults/edit-vault-dialog').then(m => ({ default: m.EditVaultDialog })),
  { ssr: false }
);
import { acceptInvitationAction, declineInvitationAction } from '@/app/vaults/actions';
import { setWorkspaceAction } from '@/app/vaults/workspace-actions';
import { useToast } from '@/hooks/use-toast';
import { performLogout } from '@/lib/auth-utils';
import { useAuthLoading } from '@/hooks/use-auth-loading';
import { useLoading } from '@/components/providers/loading-provider';
import { motion, AnimatePresence } from 'framer-motion';
import { AccessBanner } from '@/components/ui/access-banner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoadingScreen } from '../ui/loading-screen';
import { cn } from '@/lib/utils';
import { DashboardBackground } from '@/components/dashboard/dashboard-background';
import { PremiumLogo } from '@/components/ui/premium-logo';


type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  workspaceImageUrl: string | null;
  subscriptionStatus: string;
};

type Vault = {
  id: string;
  name: string;
  imageUrl: string;
  isPrivate: boolean;
  ownerId: string;
  members: User[];
};

type VaultInvitation = {
  id: string;
  vaultId: string;
  vaultName: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined';
  sender?: {
    name: string;
    avatarUrl: string | null;
  };
  vault?: {
    name: string;
    imageUrl: string | null;
    members: {
      user: {
        id: string;
        name: string;
        avatarUrl: string | null;
      };
    }[];
  } | null;
};

type VaultsPageClientProps = {
  currentUser: User;
  userVaults: Vault[];
  userInvitations: VaultInvitation[];
  canCreateVaults?: boolean;
  canAccessPersonal?: boolean;
  currentWorkspaceId?: string;
  accessInfo?: {
    status: 'active' | 'trial' | 'inactive';
    daysRemaining: number;
    message?: string;
    isRestricted: boolean;
  };
};

function WorkspaceCard({
  id,
  name,
  imageUrl,
  members,
  isPersonal = false,
  isPrivate = false,
  onEdit,
  isOwner = false,
  ownerId,
  isActive = false,
}: {
  id: string;
  name: string;
  imageUrl: string;
  members: User[];
  isPersonal?: boolean;
  isPrivate?: boolean;
  onEdit?: (vault: Vault) => void;
  isOwner?: boolean;
  ownerId?: string;
  isActive?: boolean;
}) {
  const router = useRouter();
  const { showLoading } = useLoading();
  
  const handleWorkspaceClick = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      showLoading(`Abrindo ${name}...`);
      if (typeof window !== 'undefined') {
        localStorage.setItem('workspace-navigation-pending', 'true');
      }
      const formData = new FormData(e.currentTarget);
      await setWorkspaceAction(formData);
      setTimeout(() => {
        router.push('/dashboard');
      }, 300);
    } catch (error) {
      console.error('❌ [WorkspaceCard] Erro ao trocar workspace:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('workspace-navigation-pending');
      }
    }
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="h-full relative group"
    >
      {onEdit && (
        <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="secondary" 
                size="icon" 
                className="h-10 w-10 bg-white/20 backdrop-blur-xl border border-white/50 text-white hover:bg-white/40 shadow-xl rounded-2xl transition-all"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border-none bg-white/90 backdrop-blur-xl shadow-2xl p-2">
              {isOwner ? (
                <DropdownMenuItem 
                    onClick={() => onEdit({ id, name, imageUrl, isPrivate, ownerId: ownerId || '', members })}
                    className="rounded-xl font-bold text-[#2D241E] focus:bg-[#ff6b7b]/10 focus:text-[#ff6b7b] cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar Espaço
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem disabled className="opacity-50 font-medium italic">
                  <Lock className="mr-2 h-4 w-4" />
                  Apenas Proprietário
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <form onSubmit={handleWorkspaceClick} className="h-full">
        <input type="hidden" name="workspaceId" value={id} />
        <input type="hidden" name="isPersonal" value={isPersonal.toString()} />
        <button type="submit" className="h-full w-full text-left outline-none group/btn">
          <Card className={cn(
            "overflow-hidden transition-all duration-500 h-full flex flex-col w-full border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(45,36,30,0.12)] rounded-[40px] bg-white/40 backdrop-blur-xl ring-1 ring-white/50",
            isActive && "ring-2 ring-[#ff6b7b] shadow-[0_20px_40px_rgba(255,107,123,0.15)] bg-white/60"
          )}>
            <CardHeader className="p-0 relative h-56 overflow-hidden">
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#2D241E]/80 via-[#2D241E]/20 to-transparent" />
                <Image 
                  src={imageUrl} 
                  alt={name} 
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  priority={false}
                  loading="lazy"
                  quality={85}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                
                {isActive && (
                  <div className="absolute top-6 left-6 z-20">
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#ff6b7b] text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#ff6b7b]/30 animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      Ativo Agora
                    </div>
                  </div>
                )}

                <div className="absolute bottom-6 left-6 z-20">
                  <Badge className="text-[10px] font-black uppercase tracking-[0.15em] bg-white/20 backdrop-blur-md border border-white/30 text-white px-3 py-1.5 rounded-xl">
                    {members.length} {members.length === 1 ? 'Membro' : 'Membros'}
                  </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-8 flex-grow flex flex-col justify-between">
              <div className="space-y-3">
                <CardTitle className="text-2xl font-black text-[#2D241E] tracking-tight group-hover/btn:text-[#ff6b7b] transition-colors line-clamp-1">
                  {name}
                </CardTitle>
                <div className="flex items-center gap-2 text-[#2D241E]/40 text-xs font-bold uppercase tracking-widest">
                  {isPrivate ? (
                    <><Lock className="w-3.5 h-3.5" /> Cofre Privado</>
                  ) : (
                    <><Users className="w-3.5 h-3.5" /> Workspace Compartilhado</>
                  )}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <div className="flex -space-x-4 overflow-hidden py-1">
                  {members.slice(0, 5).map((member) => (
                    <Avatar
                      key={member.id}
                      className="h-10 w-10 border-4 border-white shadow-sm ring-1 ring-[#2D241E]/5 group-hover/btn:ring-[#ff6b7b]/20 transition-all"
                    >
                      <AvatarImage src={member.avatarUrl || ''} alt={member.name} />
                      <AvatarFallback className="font-black bg-[#ff6b7b]/10 text-[#ff6b7b] text-[10px]">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {members.length > 5 && (
                    <div className="h-10 w-10 rounded-full border-4 border-white bg-[#fdfcf7] flex items-center justify-center text-[10px] font-black text-[#2D241E]/40 shadow-sm">
                      +{members.length - 5}
                    </div>
                  )}
                </div>
                
                <div className="w-12 h-12 rounded-2xl bg-[#ff6b7b]/5 flex items-center justify-center text-[#ff6b7b] group-hover/btn:bg-[#ff6b7b] group-hover/btn:text-white group-hover/btn:shadow-lg group-hover/btn:shadow-[#ff6b7b]/20 transition-all duration-500">
                  <ChevronRight className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>
        </button>
      </form>
    </motion.div>
  );
}

function InvitationCard({
  invitation,
  userId,
  onAction,
}: {
  invitation: VaultInvitation;
  userId: string;
  onAction: () => void;
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<'accept' | 'decline' | null>(null);

  const handleAccept = async () => {
    setIsLoading('accept');
    try {
      const result = await acceptInvitationAction(invitation.id, userId);
      toast({
        title: result.success ? 'Sucesso' : 'Erro',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      if (result.success) onAction();
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao aceitar convite', variant: 'destructive' });
    } finally {
      setIsLoading(null);
    }
  };

  const handleDecline = async () => {
    setIsLoading('decline');
    try {
      const result = await declineInvitationAction(invitation.id, userId);
      toast({
        title: 'Convite recusado',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      if (result.success) onAction();
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao recusar convite', variant: 'destructive' });
    } finally {
      setIsLoading(null);
    }
  };

  const vaultImageUrl = invitation.vault?.imageUrl || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1080';
  const memberAvatars = invitation.vault?.members.slice(0, 4) || [];
  const remainingMembers = (invitation.vault?.members.length || 0) - 4;

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -4 }}
        className="group relative rounded-[32px] overflow-hidden border border-white/50 bg-white/40 backdrop-blur-xl p-6 shadow-xl ring-2 ring-[#ff6b7b]/10 hover:ring-[#ff6b7b]/30 transition-all duration-300"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ff6b7b]/5 to-transparent rounded-full -mr-16 -mt-16 blur-2xl" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-5">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[24px] shadow-md border-2 border-white ring-1 ring-[#2D241E]/5">
              <Image
                src={vaultImageUrl}
                alt={invitation.vaultName}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ff6b7b] bg-[#ff6b7b]/5 px-2 py-0.5 rounded-full ring-1 ring-[#ff6b7b]/10">Convite Especial</span>
              </div>
              
              <h4 className="text-xl font-black text-[#2D241E] leading-tight">
                {invitation.vaultName}
              </h4>
              
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5 ring-1 ring-white shadow-sm">
                  <AvatarImage src={invitation.sender?.avatarUrl || ''} />
                  <AvatarFallback className="text-[8px] font-black bg-[#ff6b7b]/10 text-[#ff6b7b]">
                    {invitation.invitedBy.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-bold text-[#2D241E]/50 italic">
                  por {invitation.invitedBy}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-y border-[#2D241E]/5">
                <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-[#2D241E]/30" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40">
                        {invitation.vault?.members.length} Participantes
                    </span>
                </div>
                <div className="flex -space-x-2">
                    {memberAvatars.map((member) => (
                        <Avatar key={member.user.id} className="h-7 w-7 border-2 border-white ring-1 ring-[#2D241E]/5">
                            <AvatarImage src={member.user.avatarUrl || ''} />
                            <AvatarFallback className="text-[8px] font-black">{member.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    ))}
                </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1 h-12 rounded-2xl bg-gradient-to-br from-[#ff6b7b] to-[#fa8292] text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#ff6b7b]/20 hover:scale-105 active:scale-95 transition-all"
              onClick={handleAccept}
              disabled={!!isLoading}
            >
              {isLoading === 'accept' ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Aceitar Convite
                </>
              )}
            </Button>
            
            <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-2xl bg-[#2D241E]/5 text-[#2D241E]/40 hover:bg-red-50 hover:text-red-500 transition-all"
                onClick={handleDecline}
                disabled={!!isLoading}
            >
                {isLoading === 'decline' ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                    <X className="h-5 w-5" />
                )}
            </Button>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}


export function VaultsPageClient({
  currentUser,
  userVaults,
  userInvitations,
  canCreateVaults = true,
  currentWorkspaceId,
  accessInfo,
}: VaultsPageClientProps) {
  const router = useRouter();
  const { isLoading, message, showLoading, hideLoading } = useLoading();
  const [isCreateVaultOpen, setCreateVaultOpen] = useState(false);
  const [editingVault, setEditingVault] = useState<Vault | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loginInProgress = sessionStorage.getItem('login_in_progress');
    if (loginInProgress) {
      const timer = setTimeout(() => {
        sessionStorage.removeItem('login_in_progress');
        hideLoading();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hideLoading]);

  const handleCreateVaultClick = () => {
    if (!canCreateVaults) {
      toast({
        title: 'Acesso Restrito',
        description: 'Você precisa de uma assinatura ativa para criar novos cofres.',
        variant: 'destructive',
      });
      return;
    }
    setCreateVaultOpen(true);
  };

  const handleEditClick = (vault: Vault) => {
    setEditingVault(vault);
  };

  const handleLogout = async () => {
    const setAuthLoading = (show: boolean, message?: string) => {
      if (show) {
        showLoading(message || 'Saindo...');
      } else {
        hideLoading();
      }
    };
    await performLogout(setAuthLoading);
  };

  const handleInvitationAction = () => {
    router.refresh();
  };

  const handleNav = (href: string, message?: string) => {
    showLoading(message || 'Carregando...');
    router.push(href);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden flex flex-col">
      <DashboardBackground />
      {/* O LoadingScreen real agora é renderizado pelo LoadingProvider global no app/layout.tsx */}
      
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/20 backdrop-blur-xl border-b border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
        <div className="container mx-auto h-20 px-6 flex items-center justify-between">
          <PremiumLogo onClick={() => handleNav('/', 'Voltando...')} />


          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white/40 backdrop-blur-md rounded-full border border-white/50 shadow-sm group hover:bg-white/60 transition-all">
                <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                    <AvatarImage src={currentUser.avatarUrl || ''} alt={currentUser.name} />
                    <AvatarFallback className="font-black bg-[#ff6b7b]/10 text-[#ff6b7b] text-[10px]">{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex text-left flex-col">
                  <span className="text-xs font-black text-[#2D241E] leading-tight line-clamp-1">{currentUser.name}</span>
                  <span className="text-[9px] font-bold text-[#2D241E]/40 uppercase tracking-widest leading-none">{currentUser.email}</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full font-bold text-[11px] uppercase tracking-widest text-[#2D241E]/40 hover:bg-[#ff6b7b]/10 hover:text-[#ff6b7b]"
                onClick={() => handleNav('/profile', 'Abrindo Perfil...')}
              >
                Perfil
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full font-bold text-[11px] uppercase tracking-widest text-[#2D241E]/40 hover:bg-red-50 hover:text-red-500"
                onClick={handleLogout}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container relative z-10 mx-auto px-6 pt-40 pb-32 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24">
          <div className="text-center md:text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/60 backdrop-blur-md border border-white rounded-full shadow-sm">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6b7b] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff6b7b]"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]">Status: Online</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-[#2D241E] italic">
              Olá, <span className="text-[#ff6b7b]">{currentUser.name.split(' ')[0]}</span>! ✨
            </h2>
            <p className="text-[#2D241E]/50 text-xl font-medium italic max-w-xl">
              Sua jornada para realizar sonhos continua aqui. 
              Escolha seu espaço de trabalho ou crie um novo.
            </p>
          </div>

          {accessInfo && (
            <div className="shrink-0 flex justify-center">
              <AccessBanner
                status={accessInfo.status}
                daysRemaining={accessInfo.daysRemaining}
                message={accessInfo.message}
                showUpgradeButton={accessInfo.isRestricted}
              />
            </div>
          )}
        </div>

        <AnimatePresence>
          {userInvitations.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-20"
            >
              <div className="flex items-center justify-between mb-8 px-2">
                <div className="space-y-1">
                  <h3 className="text-2xl font-headline font-bold text-[#2D241E] italic flex items-center gap-3">
                    <Mail className="h-6 w-6 text-[#ff6b7b]" /> 
                    Convites Pendentes
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/30">Alguém quer economizar com você</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {userInvitations.map((inv) => (
                  <InvitationCard
                    key={inv.id}
                    invitation={inv}
                    userId={currentUser.id}
                    onAction={handleInvitationAction}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-2xl font-headline font-bold text-[#2D241E] italic">
                Seus Cofres
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/30">
                Gerencie seus espaços de economia e metas
              </p>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-[#2D241E]/5 via-[#2D241E]/5 to-transparent hidden sm:block mx-8" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {userVaults.map((vault) => (
                <WorkspaceCard
                  key={vault.id}
                  id={vault.id}
                  name={vault.name}
                  imageUrl={vault.imageUrl}
                  isPrivate={vault.isPrivate}
                  members={vault.members}
                  isOwner={vault.ownerId === currentUser.id}
                  ownerId={vault.ownerId}
                  onEdit={handleEditClick}
                  isActive={currentWorkspaceId === vault.id}
                />
              ))}
            </AnimatePresence>
            
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8 }}
              className="h-full"
            >
              <Card
                onClick={handleCreateVaultClick}
                className={cn(
                  "flex flex-col items-center justify-center border-2 border-dashed border-[#2D241E]/10 group transition-all duration-500 min-h-[420px] rounded-[40px] bg-white/20 backdrop-blur-sm relative overflow-hidden",
                  canCreateVaults 
                    ? "cursor-pointer hover:border-[#ff6b7b] hover:bg-white/60 hover:shadow-2xl hover:shadow-[#ff6b7b]/10" 
                    : "opacity-60 cursor-not-allowed"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b7b]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <CardContent className="p-10 text-center relative z-10">
                  <div className="mx-auto w-24 h-24 rounded-[32px] bg-white shadow-xl shadow-[#2D241E]/5 flex items-center justify-center mb-8 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 ring-1 ring-[#2D241E]/5">
                    <Plus className="h-10 w-10 text-[#ff6b7b]" />
                  </div>
                  <div className="text-2xl font-headline font-bold text-[#2D241E] italic mb-4">Criar Novo Cofre</div>
                  <p className="text-xs font-medium text-[#2D241E]/40 italic max-w-[220px] mx-auto leading-relaxed">
                    Comece um novo projeto de economia compartilhado ou pessoal hoje mesmo.
                  </p>
                  {!canCreateVaults && (
                    <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-red-100 shadow-sm">
                      <Lock className="h-3 w-3" />
                      Requer Assinatura
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
      
      <CreateVaultDialog
        open={isCreateVaultOpen}
        onOpenChange={setCreateVaultOpen}
        currentUser={currentUser}
      />
      {editingVault && (
        <EditVaultDialog
          open={!!editingVault}
          onOpenChange={(open) => !open && setEditingVault(null)}
          vault={editingVault}
        />
      )}
    </div>
  );
}
