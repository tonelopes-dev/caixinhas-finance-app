'use client';

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ExternalLink, Trash2, UserMinus, UserPlus, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import Link from 'next/link';
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
    imageUrl: string | null; // Allow null for image URL
    isPrivate: boolean;
    ownerId: string;
    members: User[];
  };
}

export function EditVaultDialog({ open, onOpenChange, vault }: EditVaultDialogProps) {
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

  // Determine the final image URL for display
  const displayImageUrl = localImagePreviewUrl || customImageUrlInput || selectedPresetImage || vault.imageUrl || coverImages[0];

  // Fetch pending invitations
  const fetchPendingInvitations = React.useCallback(async () => {
    if (open && vault.id) {
      const invitations = await getVaultPendingInvitationsAction(vault.id);
      setPendingInvitations(invitations);
    }
  }, [open, vault.id]);

  // Reset form when vault changes or dialog opens
  React.useEffect(() => {
    if (open) {
        setVaultName(vault.name);
        setIsPrivate(vault.isPrivate);
        // Reset image states based on current vault image
        if (vault.imageUrl && coverImages.includes(vault.imageUrl)) {
            setSelectedPresetImage(vault.imageUrl);
            setCustomImageUrlInput(null);
        } else if (vault.imageUrl) {
            setSelectedPresetImage(null);
            setCustomImageUrlInput(vault.imageUrl);
        } else {
            setSelectedPresetImage(coverImages[0]); // Default preset if no image
            setCustomImageUrlInput(null);
        }
        setLocalImageFile(null);
        setLocalImagePreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        fetchPendingInvitations();
    }
  }, [open, vault, fetchPendingInvitations]);

  React.useEffect(() => {
    if (state?.message && !state?.errors) {
      toast({
        title: 'Sucesso',
        description: state.message,
      });
      onOpenChange(false);
      router.refresh();
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
    setCustomImageUrlInput(null); // Clear custom URL
    setLocalImageFile(null); // Clear local file
    setLocalImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setCustomImageUrlInput(url || null);
    setSelectedPresetImage(null); // Clear preset selection
    setLocalImageFile(null); // Clear local file
    setLocalImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLocalImageFile(file);
    if (file) {
      setLocalImagePreviewUrl(URL.createObjectURL(file));
      setSelectedPresetImage(null); // Clear preset selection
      setCustomImageUrlInput(null); // Clear custom URL
    } else {
      setLocalImagePreviewUrl(null);
    }
  }

  const handleRemoveImage = () => {
    setLocalImageFile(null);
    setLocalImagePreviewUrl(null);
    setSelectedPresetImage(null); // Explicitly set to null to indicate removal
    setCustomImageUrlInput(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      const result = await cancelInvitationAction(invitationId, vault.id); // Pass vault.id
      toast({
        title: result.success ? 'Convite cancelado' : 'Erro',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      if (result.success) {
        fetchPendingInvitations();
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
        onOpenChange(false);
        router.refresh();
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
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 grid w-full sm:max-w-[600px] max-h-[90vh] overflow-y-auto translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg p-0"
        >
            <Button
                type="button"
                variant="secondary"
                size="sm"
                className="bg-white/90 hover:bg-white text-gray-900 shadow-lg font-medium"
                onClick={() => onOpenChange(false)}
            >Fechar</Button>
        <DialogHeader className="sr-only">
          <DialogTitle>Editar Vault</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
            <input type="hidden" name="vaultId" value={vault.id} />
            {/* Hidden input for imageUrl, only if no file is selected. 
                If a file is selected, the action will handle the upload. 
                If customImageUrlInput is null, it means the user cleared it or it wasn't there.
                If selectedPresetImage is null, it means no preset is selected.
                If both are null, it means the image is explicitly removed.
            */}
            {!localImageFile && (
                <input 
                    type="hidden" 
                    name="imageUrl" 
                    value={customImageUrlInput ?? selectedPresetImage ?? ''} 
                />
            )}
            
            {/* Header com imagem de fundo */}
            <div className="relative h-48 w-full overflow-hidden pt-12">
                {displayImageUrl ? (
                    <Image src={displayImageUrl} alt="Preview da Imagem" fill className="object-cover" />
                ) : (
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-full w-full" />
                )}
                <div className="absolute inset-0 bg-black/40" />
                
                {/* Botão remover imagem */}
                {(localImageFile || selectedPresetImage) && ( 
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute top-4 right-4 rounded-full bg-white/90 hover:bg-white text-gray-900"
                        onClick={handleRemoveImage}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
                
                {/* Título sobre a imagem */}
                <div className="absolute bottom-4 left-6">
                    <h2 className="text-2xl font-bold text-white mb-1">Editar Cofre</h2>
                    <p className="text-white/80 text-sm">Personalize seu cofre financeiro</p>
                </div>
            </div>

            <div className="p-6 space-y-6">

                {/* Nome do cofre */}
                <div className="space-y-3">
                    <Label htmlFor="edit-vault-name" className="text-base font-medium">Nome do Cofre</Label>
                    <Input
                        id="edit-vault-name"
                        name="name"
                        value={vaultName}
                        onChange={(e) => setVaultName(e.target.value)}
                        placeholder="Ex: Reforma da Casa, Viagem dos Sonhos..."
                        required
                        className="text-lg py-3"
                    />
                    {state?.errors?.name && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <span className="text-destructive">⚠</span>
                        {state.errors.name[0]}
                      </p>
                    )}
                </div>

                {/* Switch Privacidade */}
                <div className="flex flex-row items-center justify-between rounded-xl border border-border bg-card p-4 hover:bg-accent/50 transition-colors">
                    <div className="space-y-1">
                        <Label htmlFor="edit-is-private" className="text-base font-medium">
                            Cofre Privado
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Apenas você pode ver este cofre
                        </p>
                    </div>
                    <Switch 
                        id="edit-is-private" 
                        name="isPrivate" 
                        checked={isPrivate}
                        onCheckedChange={setIsPrivate}
                        className="scale-110"
                    />
                </div>

                {/* Upload de imagem melhorado */}
                <div className="space-y-4">
                    <Label className="text-base font-medium">Imagem de Capa</Label>

                    {/* Upload personalizado */}
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="relative border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-accent/30 group"
                    >
                        <input
                            type="file"
                            name="imageFile" 
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <div className="space-y-2">
                            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">Clique para fazer upload</p>
                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG até 10MB</p>
                            </div>
                        </div>
                        {localImageFile && (
                            <div className="mt-3 text-xs text-primary bg-primary/10 inline-block px-2 py-1 rounded-md">
                                📁 {localImageFile.name}
                            </div>
                        )}
                    </div>

                    {/* Imagens predefinidas */}
                    <div className="space-y-3">
                        <Label className="text-sm text-muted-foreground">Ou escolha uma imagem predefinida</Label>
                        <div className="grid grid-cols-3 gap-3">
                        {coverImages.map(imgSrc => (
                            <button 
                                type="button" 
                                key={imgSrc} 
                                onClick={() => handlePresetImageSelection(imgSrc)} 
                                className={cn(
                                    'relative h-24 w-full overflow-hidden rounded-lg border-2 transition-all hover:scale-105 hover:shadow-md', 
                                    selectedPresetImage === imgSrc && !localImageFile 
                                        ? 'border-primary ring-2 ring-primary/20 ring-offset-2' 
                                        : 'border-border hover:border-primary/30'
                                )}
                            >
                                <Image src={imgSrc} alt="Opção de capa" fill className="object-cover" />
                                {selectedPresetImage === imgSrc && !localImageFile && (
                                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                        <div className="bg-primary text-primary-foreground rounded-full p-1.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </div>
                                    </div>
                                )}
                            </button>
                        ))}
                        </div>
                    </div>


                </div>

                <div className="space-y-3">
                    <Label>Membros</Label>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="E-mail do novo membro" 
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                        />
                        <Button type="button" onClick={handleInvite} disabled={isInviting || !inviteEmail}>
                            {isInviting ? 'Enviando...' : <><UserPlus className="mr-2 h-4 w-4" /> Convidar</>}
                        </Button>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                        {vault.members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-2 rounded-lg border bg-card">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={member.avatarUrl || ''} />
                                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{member.name}</p>
                                        <p className="text-xs text-muted-foreground">{member.email}</p>
                                    </div>
                                </div>
                                {member.id !== vault.ownerId && (
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleRemoveMember(member.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                                {member.id === vault.ownerId && (
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Dono</span>
                                )}
                            </div>
                        ))}

                        {/* Lista de Convites Pendentes */}
                        {pendingInvitations.length > 0 && (
                          <>
                            <Label className="text-xs text-muted-foreground mt-4 block">Convites Pendentes</Label>
                            {pendingInvitations.map((invitation) => (
                              <div key={invitation.id} className="flex items-center justify-between p-2 rounded-lg border border-dashed bg-muted/30">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{invitation.email}</p>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-[10px] h-5 px-1 bg-yellow-500/10 text-yellow-600 border-yellow-200">
                                        Pendente
                                      </Badge>
                                      <span className="text-[10px] text-muted-foreground">
                                        Enviado por {invitation.invitedBy}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-muted-foreground hover:text-destructive"
                                  onClick={() => handleCancelInvitation(invitation.id)}
                                  title="Cancelar convite"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </>
                        )}
                    </div>
                </div>


               
            </div>
            
            {/* Rodapé com botões */}
            <div className="flex flex-col sm:flex-row gap-3 p-6 bg-muted/30 border-t">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                    className="flex-1 font-medium"
                >
                    Cancelar
                </Button>
                <Button 
                    type="submit" 
                    disabled={isPending || !vaultName.trim()}
                    className="flex-1 font-medium bg-primary hover:bg-primary/90"
                >
                    {isPending ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Salvando...
                        </>
                    ) : (
                        <>
                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Salvar Alterações
                        </>
                    )}
                </Button>

                
            </div>
             {/* Zona de Perigo */}
                <div className="pt-6 mt-6 border-t border-destructive/20">
                    <div className="bg-destructive/5 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-destructive"></div>
                            <Label className="text-destructive font-medium">Zona de Perigo</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Esta ação é irreversível. O cofre e todos os dados serão permanentemente removidos.
                        </p>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button 
                                    type="button" 
                                    variant="destructive" 
                                    className="w-full bg-destructive/90 hover:bg-destructive text-white font-medium"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> 
                                    Excluir Cofre Permanentemente
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2">
                                        <Trash2 className="h-5 w-5 text-destructive" />
                                        Confirmar Exclusão
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="space-y-2">
                                        <p>Esta ação não pode ser desfeita. Isso excluirá permanentemente:</p>
                                        <div className="bg-destructive/5 p-3 rounded-md">
                                            <p className="font-semibold text-destructive">"{vault.name}"</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                • Todas as transações<br/>
                                                • Histórico completo<br/>
                                                • Dados de membros
                                            </p>
                                        </div>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="font-medium">
                                        Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction 
                                        onClick={handleDeleteVault} 
                                        disabled={isDeleting} 
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Excluindo...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Sim, excluir cofre
                                            </>
                                        )}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
        </form>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
