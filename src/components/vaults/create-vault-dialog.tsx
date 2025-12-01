'use client';

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ExternalLink, X } from 'lucide-react'; // Removed Plus
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import Link from 'next/link';
import { VaultCreationSuccessDialog } from './vault-creation-success-dialog';
import { createVaultAction } from '@/app/vaults/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

const coverImages = [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800',
    'https://images.unsplash.com/photo-1519642918688-7e43b19245d8?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800',
];

interface CreateVaultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: User;
}

export function CreateVaultDialog({ open, onOpenChange, currentUser }: CreateVaultDialogProps) {
  const [vaultName, setVaultName] = useState('');
  const [selectedPresetImage, setSelectedPresetImage] = useState<string | null>(coverImages[0]);
  const [customImageUrlInput, setCustomImageUrlInput] = useState('');
  const [localImageFile, setLocalImageFile] = useState<File | null>(null);
  const [localImagePreviewUrl, setLocalImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  const [state, formAction, isPending] = useActionState(createVaultAction, {
    message: null,
  });

  // Determine the final image URL for display
  const displayImageUrl = localImagePreviewUrl || customImageUrlInput || selectedPresetImage;

  React.useEffect(() => {
    if (state?.message && !state?.errors) {
      toast({
        title: 'Sucesso',
        description: state.message,
      });
      
      // Reset form
      setVaultName('');
      setSelectedPresetImage(coverImages[0]);
      setCustomImageUrlInput('');
      setLocalImageFile(null);
      setLocalImagePreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      onOpenChange(false);
      setSuccessModalOpen(true);
      router.refresh();
    } else if (state?.errors) {
      toast({
        title: 'Erro',
        description: state.message || 'Erro ao criar cofre',
        variant: 'destructive',
      });
    }
  }, [state, toast, onOpenChange, router]);
  
  
  const handlePresetImageSelection = (imageUrl: string) => {
    setSelectedPresetImage(imageUrl);
    setCustomImageUrlInput(''); // Clear custom URL
    setLocalImageFile(null); // Clear local file
    setLocalImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setCustomImageUrlInput(url);
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
      setCustomImageUrlInput(''); // Clear custom URL
    } else {
      setLocalImagePreviewUrl(null);
    }
  }

  const handleRemoveImage = () => {
    setLocalImageFile(null);
    setLocalImagePreviewUrl(null);
    setSelectedPresetImage(coverImages[0]); // Revert to a default preset
    setCustomImageUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <>
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[525px]">
            <form action={formAction} encType="multipart/form-data"> {/* Add encType */}
                <DialogHeader>
                <DialogTitle className="font-headline text-xl">Criar Novo Cofre Compartilhado</DialogTitle>
                <DialogDescription>
                    Comece um novo espaço para planejar e economizar em conjunto.
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <input type="hidden" name="userId" value={currentUser.id} />
                    <div className="space-y-2">
                        <Label htmlFor="vault-name">Nome do Cofre</Label>
                        <Input
                            id="vault-name"
                            name="name"
                            value={vaultName}
                            onChange={(e) => setVaultName(e.target.value)}
                            placeholder="Ex: Reforma da Casa"
                            required
                        />
                        {state?.errors?.name && (
                          <p className="text-sm text-destructive">{state.errors.name[0]}</p>
                        )}
                    </div>

                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="is-private" className="text-base">
                                Cofre Privado
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Cofres privados são visíveis apenas para você.
                            </p>
                        </div>
                        <Switch id="is-private" name="isPrivate" />
                    </div>

                    <div className="space-y-4"> {/* Increased spacing */}
                        <Label>Imagem de Capa</Label>
                        <div className="relative h-40 w-full rounded-md border flex items-center justify-center overflow-hidden">
                            {displayImageUrl ? (
                                <Image src={displayImageUrl} alt="Preview da Imagem" fill className="object-cover" />
                            ) : (
                                <span className="text-muted-foreground">Sem imagem</span>
                            )}
                            {(localImageFile || customImageUrlInput) && ( 
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 rounded-full bg-background/80"
                                    onClick={handleRemoveImage}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {/* File Upload Input */}
                        <div className="space-y-2">
                            <Label htmlFor="image-file">Upload de Imagem (local)</Label>
                            <Input
                                id="image-file"
                                type="file"
                                name="imageFile" 
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* Preset Images */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Label>Ou selecione uma imagem predefinida</Label>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                            {coverImages.map(imgSrc => (
                                <button type="button" key={imgSrc} onClick={() => handlePresetImageSelection(imgSrc)} className={cn('relative h-20 w-full overflow-hidden rounded-md border-2 transition-all', selectedPresetImage === imgSrc && !localImageFile && !customImageUrlInput ? 'border-primary ring-2 ring-primary' : 'border-transparent')}>
                                    <Image src={imgSrc} alt="Imagem de capa" fill className="object-cover" />
                                </button>
                            ))}
                            </div>
                        </div>

                        {/* Custom URL Input */}
                        <div className="space-y-2 mt-2">
                            <Label htmlFor="custom-image-url">Ou cole a URL de uma imagem externa</Label>
                            <Input 
                                id="custom-image-url"
                                placeholder="https://images.unsplash.com/..."
                                value={customImageUrlInput}
                                onChange={handleCustomUrlChange}
                            />
                            {/* Hidden input for imageUrl, only if no file and no custom URL selected */}
                            {!localImageFile && !customImageUrlInput && selectedPresetImage && (
                              <input type="hidden" name="imageUrl" value={selectedPresetImage} />
                            )}
                            {/* Hidden input for imageUrl, if custom URL selected */}
                            {!localImageFile && customImageUrlInput && (
                              <input type="hidden" name="imageUrl" value={customImageUrlInput} />
                            )}

                            {state?.errors?.imageUrl && (
                              <p className="text-sm text-destructive">{state.errors.imageUrl[0]}</p>
                            )}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                <Button type="submit" disabled={isPending || !vaultName.trim()}>
                  {isPending ? 'Criando...' : 'Criar Cofre'}
                </Button>
                </DialogFooter>
            </form>
        </DialogContent>
        </Dialog>
        <VaultCreationSuccessDialog open={isSuccessModalOpen} onOpenChange={setSuccessModalOpen} />
    </>
  );
}
