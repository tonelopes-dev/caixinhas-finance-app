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
  const displayImageUrl = localImagePreviewUrl || selectedPresetImage;

  // Função customizada para processar o envio do formulário
  const handleSubmit = async (formData: FormData) => {
    // Se há um arquivo local, adiciona ao FormData
    if (localImageFile) {
      formData.set('imageFile', localImageFile);
      // Remove a URL da imagem predefinida se há um arquivo local
      formData.delete('imageUrl');
    }
    
    // Chama a action original
    return formAction(formData);
  };

  React.useEffect(() => {
    if (state?.message && !state?.errors) {
      toast({
        title: 'Sucesso',
        description: state.message,
      });
      
      // Reset form
      setVaultName('');
      setSelectedPresetImage(coverImages[0]);
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
    } else {
      setLocalImagePreviewUrl(null);
    }
  }

  const handleRemoveImage = () => {
    setLocalImageFile(null);
    setLocalImagePreviewUrl(null);
    setSelectedPresetImage(coverImages[0]); // Revert to a default preset
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <>
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0">
            <DialogHeader className="sr-only">
              <DialogTitle>Criar Novo Vault</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit}>
                <input type="hidden" name="userId" value={currentUser.id} />
                {!localImageFile && (
                    <input 
                        type="hidden" 
                        name="imageUrl" 
                        value={selectedPresetImage ?? ''} 
                    />
                )}
                
                {/* Header com imagem de fundo */}
                <div className="relative h-48 w-full overflow-hidden">
                    {displayImageUrl ? (
                        <Image src={displayImageUrl} alt="Preview da Imagem" fill className="object-cover" />
                    ) : (
                        <div className="bg-gradient-to-br from-green-500 to-blue-600 h-full w-full" />
                    )}
                    <div className="absolute inset-0 bg-black/40" />
                    
                    {/* Botão remover imagem */}
                    {(localImageFile || selectedPresetImage !== coverImages[0]) && ( 
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
                        <h2 className="text-2xl font-bold text-white mb-1">Criar Novo Cofre</h2>
                        <p className="text-white/80 text-sm">Planeje e economize em conjunto</p>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Nome do cofre */}
                    <div className="space-y-3">
                        <Label htmlFor="vault-name" className="text-base font-medium">Nome do Cofre</Label>
                        <Input
                            id="vault-name"
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
                            <Label htmlFor="is-private" className="text-base font-medium">
                                Cofre Privado
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Apenas você pode ver este cofre
                            </p>
                        </div>
                        <Switch id="is-private" name="isPrivate" className="scale-110" />
                    </div>

                    <div className="space-y-4"> {/* Increased spacing */}
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
                        <div className="relative h-40 w-full rounded-md border flex items-center justify-center overflow-hidden">
                            {displayImageUrl ? (
                                <Image src={displayImageUrl} alt="Preview da Imagem" fill className="object-cover" />
                            ) : (
                                <span className="text-muted-foreground">Sem imagem</span>
                            )}
                            {localImageFile && ( 
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
                                Criando...
                            </>
                        ) : (
                            <>
                                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Criar Cofre
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </DialogContent>
        </Dialog>
        <VaultCreationSuccessDialog open={isSuccessModalOpen} onOpenChange={setSuccessModalOpen} />
    </>
  );
}
