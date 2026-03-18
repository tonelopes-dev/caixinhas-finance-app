'use client';

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from '@/components/ui/mobile-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Trash2, 
  UserPlus, 
  X, 
  Settings, 
  ImageIcon, 
  Users, 
  AlertTriangle,
  Globe,
  Lock,
  Check,
  Save
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { 
  updateVaultAction, 
  deleteVaultAction, 
  removeMemberAction, 
  inviteToVaultAction,
  getVaultPendingInvitationsAction,
  cancelInvitationAction
} from '@/app/vaults/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'framer-motion';
import { compressImage } from '@/lib/image-utils';

const coverImages = [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800',
    'https://images.unsplash.com/photo-1519642918688-7e43b19245d8?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800',
];

type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  subscriptionStatus: string;
};

interface EditVaultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vault: {
    id: string;
    name: string;
    imageUrl: string | null;
    isPrivate: boolean;
    ownerId: string;
    members: User[];
  };
}

export function EditVaultDialog({ open, onOpenChange, vault }: EditVaultDialogProps) {
  const [activeTab, setActiveTab] = useState("geral");
  const [vaultName, setVaultName] = useState(vault.name);
  const [selectedPresetImage, setSelectedPresetImage] = useState<string | null>(null);
  const [customImageUrlInput, setCustomImageUrlInput] = useState<string | null>(null);
  const [localImageFile, setLocalImageFile] = useState<File | null>(null);
  const [localImagePreviewUrl, setLocalImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPrivate, setIsPrivate] = useState(vault.isPrivate);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  
  const [state, formAction, isPending] = useActionState(updateVaultAction, {
    message: null,
  });

  const displayImageUrl = localImagePreviewUrl || customImageUrlInput || selectedPresetImage || vault.imageUrl || coverImages[0];

  const fetchPendingInvitations = React.useCallback(async () => {
    if (open && vault.id) {
      const invitations = await getVaultPendingInvitationsAction(vault.id);
      setPendingInvitations(invitations);
    }
  }, [open, vault.id]);

  React.useEffect(() => {
    if (open) {
        setVaultName(vault.name);
        setIsPrivate(vault.isPrivate);
        if (vault.imageUrl && coverImages.includes(vault.imageUrl)) {
            setSelectedPresetImage(vault.imageUrl);
            setCustomImageUrlInput(null);
        } else if (vault.imageUrl) {
            setSelectedPresetImage(null);
            setCustomImageUrlInput(vault.imageUrl);
        } else {
            setSelectedPresetImage(coverImages[0]);
            setCustomImageUrlInput(null);
        }
        setLocalImageFile(null);
        setLocalImagePreviewUrl(null);
        fetchPendingInvitations();
    }
  }, [open, vault, fetchPendingInvitations]);

  React.useEffect(() => {
    if (state?.message && !state?.errors) {
      toast({
        title: 'Sucesso',
        description: state.message,
      });
      React.startTransition(() => {
        router.refresh();
      });
      setTimeout(() => {
        onOpenChange(false);
      }, 150);
    } else if (state?.errors) {
      toast({
        title: 'Erro',
        description: state.message || 'Erro ao atualizar cofre',
        variant: 'destructive',
      });
    }
  }, [state, toast, onOpenChange, router]);

  const handlePresetImageSelection = (imageUrl: string) => {
    setSelectedPresetImage(imageUrl);
    setCustomImageUrlInput(null);
    setLocalImageFile(null);
    setLocalImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      try {
        const compressed = await compressImage(file);
        setLocalImageFile(compressed);
        setLocalImagePreviewUrl(URL.createObjectURL(compressed));
        setSelectedPresetImage(null);
        setCustomImageUrlInput(null);
      } catch (error) {
        console.error('Erro ao comprimir imagem:', error);
        setLocalImageFile(file);
        setLocalImagePreviewUrl(URL.createObjectURL(file));
        setSelectedPresetImage(null);
        setCustomImageUrlInput(null);
      }
    } else {
      setLocalImagePreviewUrl(null);
      setLocalImageFile(null);
    }
  }

  const handleRemoveImage = () => {
    setLocalImageFile(null);
    setLocalImagePreviewUrl(null);
    setSelectedPresetImage(null);
    setCustomImageUrlInput(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setIsInviting(true);
    try {
      const result = await inviteToVaultAction(vault.id, inviteEmail);
      toast({
        title: result.success ? 'Convite enviado' : 'Erro',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      if (result.success) {
        setInviteEmail('');
        fetchPendingInvitations();
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao enviar convite',
        variant: 'destructive',
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const result = await cancelInvitationAction(invitationId, vault.id);
      toast({
        title: result.success ? 'Convite cancelado' : 'Erro',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      if (result.success) {
        React.startTransition(() => {
          fetchPendingInvitations();
          router.refresh(); // Refresh to reflect changes in member list if needed
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao cancelar convite',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      const result = await removeMemberAction(vault.id, userId);
      toast({
        title: result.success ? 'Membro removido' : 'Erro',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      if (result.success) router.refresh();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao remover membro',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteVault = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteVaultAction(vault.id);
      toast({
        title: result.success ? 'Cofre excluído' : 'Erro',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      if (result.success) {
        // Sequência mais robusta para garantir o refresh antes de desmontar o componente
        router.refresh();
        setTimeout(() => {
          onOpenChange(false);
        }, 100);
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir cofre',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl bg-background">
        <DialogHeader className="sr-only">
          <DialogTitle>Editar Cofre: {vault.name}</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="flex flex-col h-full max-h-[90vh]">
          <input type="hidden" name="vaultId" value={vault.id} />
          <input type="hidden" name="isPrivate" value={isPrivate.toString()} />
          {!localImageFile && (
            <input 
              type="hidden" 
              name="imageUrl" 
              value={customImageUrlInput ?? selectedPresetImage ?? ''} 
            />
          )}

          {/* Header com Preview e Tabs */}
          <div className="relative">
            <div className="h-32 w-full overflow-hidden relative">
              {displayImageUrl ? (
                <Image src={displayImageUrl} alt="Capa" fill className="object-cover" sizes="(max-width: 768px) 100vw, 550px" />
              ) : (
                <div className="bg-gradient-to-br from-primary/80 to-accent/80 h-full w-full" />
              )}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
              <div className="absolute bottom-12 left-6 right-6">
                <h2 className="text-xl font-bold text-white truncate">{vaultName}</h2>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="bg-background px-6 -mt-6 relative z-10 rounded-t-3xl pt-4">
                <TabsList className="w-full bg-muted/50 p-1 h-12 rounded-xl">
                  <TabsTrigger value="geral" className="flex-1 rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Geral</span>
                  </TabsTrigger>
                  <TabsTrigger value="capa" className="flex-1 rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    <ImageIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Capa</span>
                  </TabsTrigger>
                  <TabsTrigger value="membros" className="flex-1 rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Membros</span>
                  </TabsTrigger>
                  <TabsTrigger value="perigo" className="flex-1 rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="hidden sm:inline">Perigo</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 min-h-[300px]">
                <TabsContent value="geral" className="space-y-6 mt-0 animate-in fade-in duration-300">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-vault-name" className="text-sm font-semibold">Nome do Cofre</Label>
                      <Input
                        id="edit-vault-name"
                        name="name"
                        value={vaultName}
                        onChange={(e) => setVaultName(e.target.value)}
                        placeholder="Ex: Reforma da Casa..."
                        className="h-12 rounded-xl focus-visible:ring-primary"
                        required
                      />
                    </div>

                    <div className="pt-2">
                      <Label className="text-sm font-semibold mb-3 block">Configuração de Privacidade</Label>
                      <div className="grid grid-cols-1 gap-3">
                        <button
                          type="button"
                          onClick={() => setIsPrivate(false)}
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all",
                            !isPrivate ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/20"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                            !isPrivate ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                          )}>
                            <Globe className="w-5 h-5" />
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <p className="font-bold text-sm">Cofre em Conjunto</p>
                            <p className="text-xs text-muted-foreground">Convide família ou amigos para pouparem juntos.</p>
                          </div>
                          {!isPrivate && <Check className="w-4 h-4 text-primary" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsPrivate(true)}
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all",
                            isPrivate ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/20"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                            isPrivate ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                          )}>
                            <Lock className="w-5 h-5" />
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <p className="font-bold text-sm">Cofre Privado</p>
                            <p className="text-xs text-muted-foreground">Apenas você terá acesso. Seus sonhos, sua privacidade.</p>
                          </div>
                          {isPrivate && <Check className="w-4 h-4 text-primary" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="capa" className="space-y-6 mt-0 animate-in fade-in duration-300">
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {coverImages.map(imgSrc => (
                        <button 
                          type="button" 
                          key={imgSrc} 
                          onClick={() => handlePresetImageSelection(imgSrc)} 
                          className={cn(
                            'relative h-20 w-full overflow-hidden rounded-xl border-2 transition-all hover:scale-105', 
                            selectedPresetImage === imgSrc && !localImageFile 
                              ? 'border-primary ring-2 ring-primary/20 scale-105' 
                              : 'border-transparent opacity-70 hover:opacity-100'
                          )}
                        >
                          <Image src={imgSrc} alt="Capa" fill className="object-cover" sizes="150px" />
                          {selectedPresetImage === imgSrc && !localImageFile && (
                            <div className="absolute inset-1 flex items-start justify-end">
                              <Check className="w-5 h-5 text-white bg-primary rounded-full p-1" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-muted" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Ou envie a sua</span>
                      </div>
                    </div>

                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full py-8 border-dashed border-2 rounded-xl group hover:border-primary transition-all bg-muted/20"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium">{localImageFile ? localImageFile.name : 'Clique para buscar no seu celular'}</span>
                      </div>
                      <input
                        type="file"
                        name="imageFile" 
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="membros" className="space-y-6 mt-0 animate-in fade-in duration-300">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="E-mail do novo membro" 
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="h-11 rounded-xl"
                      />
                      <Button 
                        type="button" 
                        onClick={handleInvite} 
                        disabled={isInviting || !inviteEmail}
                        className="rounded-xl h-11"
                      >
                        <UserPlus className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">{isInviting ? 'Enviando...' : 'Convidar'}</span>
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Membros Atuais</Label>
                      <div className="space-y-2">
                        {vault.members.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-3 rounded-xl border bg-card/50 transition-colors hover:bg-card">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border-2 border-background">
                                <AvatarImage src={member.avatarUrl || ''} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">{member.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-bold leading-none">{member.name}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">{member.email}</p>
                              </div>
                            </div>
                            {member.id !== vault.ownerId ? (
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                                onClick={() => handleRemoveMember(member.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold text-[10px] px-2">DONO</Badge>
                            )}
                          </div>
                        ))}
                      </div>

                      {pendingInvitations.length > 0 && (
                        <div className="pt-4 space-y-3">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Convites Enviados</Label>
                          {pendingInvitations.map((invitation) => (
                            <div key={invitation.id} className="flex items-center justify-between p-3 rounded-xl border border-dashed bg-muted/20">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium truncate max-w-[150px] sm:max-w-none">{invitation.email}</p>
                                  <p className="text-[10px] text-muted-foreground">Pendente</p>
                                </div>
                              </div>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                                onClick={() => handleCancelInvitation(invitation.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="perigo" className="space-y-6 mt-0 animate-in fade-in duration-300">
                  <div className="space-y-4">
                    <div className="bg-destructive/5 rounded-2xl p-6 border border-destructive/20 text-center space-y-4">
                      <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-destructive" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-destructive">Cuidado! Ação Irreversível</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Ao excluir este cofre, todos os dados, transações e histórico serão apagados para sempre.
                        </p>
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            type="button" 
                            variant="destructive" 
                            className="w-full h-12 rounded-xl font-bold bg-destructive shadow-lg shadow-destructive/20"
                          >
                            <Trash2 className="mr-2 h-5 w-5" /> 
                            Excluir Cofre Agora
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl border-none">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-3 text-destructive">
                              <div className="p-2 rounded-full bg-destructive/10">
                                <AlertTriangle className="h-5 w-5" />
                              </div>
                              Tem certeza absoluta?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="pt-2">
                              Você está prestes a apagar o cofre <span className="font-bold text-foreground">"{vault.name}"</span>. 
                              Essa ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="pt-4">
                            <AlertDialogCancel className="rounded-xl border-none bg-muted font-bold h-11">Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleDeleteVault} 
                              disabled={isDeleting} 
                              className="rounded-xl bg-destructive text-white font-bold h-11 hover:bg-destructive/90"
                            >
                              {isDeleting ? 'Excluindo...' : 'Sim, excluir para sempre'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Footer Fixo */}
          <div className="p-6 bg-muted/10 border-t flex gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 rounded-xl font-bold"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || !vaultName.trim()}
              className="flex-1 h-12 text-md font-bold rounded-xl gradient-button text-white border-none shadow-lg shadow-primary/20"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Salvando...</span>
                </div>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Botão fechar flutuante */}
        <button 
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors z-[60]"
        >
          <X className="w-5 h-5" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
