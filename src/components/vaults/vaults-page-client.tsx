'use client';

import { useState, useEffect } from 'react';
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
import { CreateVaultDialog } from '@/components/vaults/create-vault-dialog';
import { EditVaultDialog } from '@/components/vaults/edit-vault-dialog';
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="h-full relative group"
    >
      {onEdit && (
        <div className="absolute top-3 right-3 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="secondary" 
                size="icon" 
                className="h-9 w-9 bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/40 shadow-lg rounded-full"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-border/50">
              {isOwner ? (
                <DropdownMenuItem onClick={() => onEdit({ id, name, imageUrl, isPrivate, ownerId: ownerId || '', members })}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar Espaço
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem disabled>
                  <Pencil className="mr-2 h-4 w-4 opacity-50" />
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
        <button type="submit" className="h-full w-full text-left outline-none group">
          <Card className={cn(
            "overflow-hidden transition-all duration-500 h-full flex flex-col w-full border-none shadow-xl",
            isActive ? "ring-2 ring-primary bg-primary/5" : "hover:bg-accent/5"
          )}>
            <CardHeader className="p-0 relative h-48 sm:h-52">
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <Image 
                  src={imageUrl} 
                  alt={name} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  priority={false}
                  loading="lazy"
                  quality={80}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                
                {isActive && (
                  <div className="absolute top-4 left-4 z-20">
                    <Badge className="bg-primary text-white font-bold shadow-lg shadow-primary/40 border-none px-3 py-1 animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-white mr-2" />
                      Ativo
                    </Badge>
                  </div>
                )}

                <div className="absolute bottom-4 left-4 z-20">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-widest bg-black/30 backdrop-blur-sm border-white/20 text-white font-semibold">
                    {members.length} {members.length === 1 ? 'Membro' : 'Membros'}
                  </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-6 flex-grow flex flex-col justify-between bg-card/10 backdrop-blur-sm">
              <div className="space-y-2">
                <CardTitle className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                  {name}
                </CardTitle>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  {isPrivate ? (
                    <><Lock className="w-3.5 h-3.5" /> Privado</>
                  ) : (
                    <><Users className="w-3.5 h-3.5" /> Em Conjunto</>
                  )}
                </div>
              </div>

              {members && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex -space-x-3 overflow-hidden">
                    {members.slice(0, 5).map((member) => (
                      <Avatar
                        key={member.id}
                        className="h-9 w-9 border-4 border-card bg-muted ring-2 ring-transparent group-hover:ring-primary/20 transition-all"
                      >
                        <AvatarImage src={member.avatarUrl || ''} alt={member.name} />
                        <AvatarFallback className="font-bold bg-primary/10 text-primary text-xs">{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {members.length > 5 && (
                      <div className="h-9 w-9 rounded-full border-4 border-card bg-muted flex items-center justify-center text-[10px] font-bold">
                        +{members.length - 5}
                      </div>
                    )}
                  </div>
                  
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </div>
              )}
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
  const [isHovered, setIsHovered] = useState(false);

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
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, x: -50, scale: 0.95, transition: { duration: 0.3 } }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="group relative rounded-xl border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-lg hover:border-primary/40 hover:shadow-xl transition-all duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-accent/10 opacity-60" />
        
        <div className="relative z-10 mb-4">
          <div className="flex items-start gap-4">
            <div className="relative overflow-hidden rounded-lg">
              <Image
                src={vaultImageUrl}
                alt={`Capa do cofre ${invitation.vaultName}`}
                width={80}
                height={80}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="h-4 w-4 text-primary" />
                <Badge variant="secondary" className="text-xs">
                  Convite Pendente
                </Badge>
              </div>
              
              <h4 className="text-lg font-bold text-foreground mb-1 truncate">
                {invitation.vaultName}
              </h4>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={invitation.sender?.avatarUrl || ''} />
                  <AvatarFallback className="text-xs bg-primary/10">
                    {invitation.invitedBy.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>
                  Convite de <span className="font-semibold text-foreground">{invitation.invitedBy}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {memberAvatars.length > 0 && (
          <div className="relative z-10 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {invitation.vault?.members.length} {invitation.vault?.members.length === 1 ? 'membro' : 'membros'}
              </span>
            </div>
            
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {memberAvatars.map((member, index) => (
                  <Tooltip key={member.user.id}>
                    <TooltipTrigger asChild>
                      <Avatar 
                        className="h-8 w-8 border-2 border-background hover:scale-110 hover:z-10 transition-all duration-200 cursor-pointer"
                        style={{ zIndex: memberAvatars.length - index }}
                      >
                        <AvatarImage src={member.user.avatarUrl || ''} />
                        <AvatarFallback className="text-xs bg-primary/20">
                          {member.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="top" 
                      className="z-[100] bg-popover border border-border shadow-xl px-3 py-2 rounded-lg"
                      sideOffset={8}
                    >
                      <p className="font-medium text-sm whitespace-nowrap text-popover-foreground">
                        {member.user.name}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
                
                {remainingMembers > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground hover:scale-110 transition-all duration-200 cursor-pointer">
                        +{remainingMembers}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="top" 
                      className="z-[100] bg-popover border border-border shadow-xl px-3 py-2 rounded-lg"
                      sideOffset={8}
                    >
                      <p className="text-sm whitespace-nowrap text-popover-foreground">
                        Mais {remainingMembers} {remainingMembers === 1 ? 'membro' : 'membros'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="relative z-10 flex gap-3">
          <Button
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
            onClick={handleAccept}
            disabled={!!isLoading}
          >
            {isLoading === 'accept' ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Aceitar Convite
              </>
            )}
          </Button>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-destructive/20 hover:border-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
                onClick={handleDecline}
                disabled={!!isLoading}
              >
                {isLoading === 'decline' ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Recusar convite</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          animate={{ opacity: isHovered ? 1 : 0 }}
        />
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
  const [isCreateVaultOpen, setCreateVaultOpen] = useState(false);
  const [editingVault, setEditingVault] = useState<Vault | null>(null);
  const { isVisible, message, setAuthLoading } = useAuthLoading();
  const { toast } = useToast();

  useEffect(() => {
    const loginInProgress = sessionStorage.getItem('login_in_progress');
    if (loginInProgress) {
      const timer = setTimeout(() => {
        sessionStorage.removeItem('login_in_progress');
        setAuthLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [setAuthLoading]);

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
    await performLogout(setAuthLoading);
  };

  const handleInvitationAction = () => {
    router.refresh();
  };

  return (
    <div className="min-h-screen premium-bg pb-20">
      {isVisible && <LoadingScreen message={message} />}
      
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 transition-all duration-300 shadow-sm overflow-hidden">
        <div className="container mx-auto h-20 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/')}>
            <Image
              src="/logo-caixinhas.png"
              alt="Caixinhas Logo"
              width={40}
              height={40}
              quality={100}
              className="w-10 h-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
            />
            <span className="text-xl font-bold text-foreground tracking-tight hidden sm:block">
              Caixinhas
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="font-semibold text-sm leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-muted-foreground">{currentUser.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-foreground hover:bg-primary/10"
                onClick={() => router.push('/profile')}
              >
                Perfil
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 pt-32 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="text-center md:text-left animate-fade-in-up">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              Olá, {currentUser.name.split(' ')[0]}! ✨
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Sua jornada para realizar sonhos começa aqui. 
              <br className="hidden md:block" /> Escolha um espaço abaixo:
            </p>
          </div>

          {accessInfo && (
            <div className="animate-fade-in shrink-0">
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    <Mail className="h-6 w-6 text-primary" /> 
                    Convites Pendentes
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {userInvitations.length} {userInvitations.length === 1 ? 'convite aguardando' : 'convites aguardando'} sua decisão
                  </p>
                </div>
                <Badge variant="secondary" className="px-3 py-1">
                  {userInvitations.length}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <div className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                Seus Cofres
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie seus espaços de economia
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <Card
                onClick={handleCreateVaultClick}
                className={cn(
                  "flex flex-col items-center justify-center border-dashed border-2 group transition-all duration-300 min-h-[280px] rounded-2xl bg-muted/20 backdrop-blur-sm",
                  canCreateVaults 
                    ? "cursor-pointer hover:border-primary hover:bg-primary/5 hover:shadow-xl hover:shadow-primary/10" 
                    : "opacity-50 cursor-not-allowed"
                )}
              >
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Plus className="h-8 w-8" />
                  </div>
                  <div className="text-lg font-bold">Criar Novo Cofre</div>
                  <p className="text-sm text-muted-foreground mt-2 max-w-[180px] mx-auto">
                    Comece um novo projeto de economia hoje mesmo
                  </p>
                  {!canCreateVaults && (
                    <Badge variant="outline" className="mt-4 border-destructive/30 text-destructive font-bold">
                      🔒 Requer assinatura
                    </Badge>
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
