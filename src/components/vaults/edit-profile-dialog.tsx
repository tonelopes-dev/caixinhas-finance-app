'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/mobile-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import Link from 'next/link';
import { updateUserAction } from '@/app/profile/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';

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
};

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function EditProfileDialog({ open, onOpenChange, user }: EditProfileDialogProps) {
  const [name, setName] = React.useState(user.name);
  const [selectedImage, setSelectedImage] = React.useState(user.avatarUrl || coverImages[0]);
  const [customImageUrl, setCustomImageUrl] = React.useState('');
  const { toast } = useToast();
  const router = useRouter();
  
  const [state, formAction, isPending] = useActionState(updateUserAction, {
    message: null,
    success: false
  });

  React.useEffect(() => {
    if (open) {
        setName(user.name);
        setSelectedImage(user.avatarUrl || coverImages[0]);
        setCustomImageUrl('');
    }
  }, [open, user]);

  React.useEffect(() => {
    if (state?.success) {
      toast({
        title: 'Sucesso',
        description: state.message,
      });
      onOpenChange(false);
      router.refresh();
    } else if (state?.success === false && state?.message) {
      toast({
        title: 'Erro',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast, onOpenChange, router]);

  const handleImageSelection = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setCustomImageUrl('');
  }

  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomImageUrl(e.target.value);
    setSelectedImage(e.target.value);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] p-0 overflow-hidden border-none shadow-2xl bg-[#fdfcf7]" mobileOptimized={true}>
        <form action={formAction}>
            <DialogHeader className="p-8 pb-6 bg-white/50 border-b border-[#2D241E]/5 space-y-2">
              <div className="flex items-center gap-3 mb-1">
                  <div className="h-2 w-2 rounded-full bg-[#ff6b7b] animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff6b7b]">Meu Perfil</span>
              </div>
              <DialogTitle className="text-3xl font-headline italic text-[#2D241E] tracking-tight">Editar <span className="text-[#ff6b7b]">Informações</span></DialogTitle>
              <DialogDescription className="text-sm font-bold text-[#2D241E]/40 italic leading-relaxed">
                  Atualize suas informações e a imagem da sua conta pessoal.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 p-8">
                <div className="space-y-2">
                    <Label htmlFor="user-name" className="text-xs font-black uppercase tracking-widest text-[#2D241E]/40">Seu Nome</Label>
                    <Input
                        id="user-name"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome"
                        className="h-12 rounded-xl border-2 border-[#2D241E]/5 bg-white font-bold text-[#2D241E] focus:ring-[#ff6b7b]/20 transition-all"
                        required
                    />
                    {state?.errors?.name && (
                      <p className="text-xs font-bold text-destructive italic">{state.errors.name[0]}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-[#2D241E]/40">Imagem de Perfil / Capa</Label>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-6 w-6 rounded-lg border-2 border-[#2D241E]/5 hover:bg-[#ff6b7b]/10 hover:text-[#ff6b7b] transition-all" asChild>
                                        <Link href="https://unsplash.com" target="_blank">
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="rounded-xl border-[#2D241E]/5 font-bold text-[10px] uppercase tracking-wider">
                                    <p>Copie a URL de uma imagem do Unsplash.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                    {coverImages.map(imgSrc => (
                        <button type="button" key={imgSrc} onClick={() => handleImageSelection(imgSrc)} className={cn('relative h-20 w-full overflow-hidden rounded-2xl border-2 transition-all hover:scale-105', selectedImage === imgSrc && !customImageUrl ? 'border-[#ff6b7b] shadow-lg shadow-[#ff6b7b]/20' : 'border-transparent opacity-60 hover:opacity-100')}>
                            <Image src={imgSrc} alt="Imagem de capa" fill className="object-cover" />
                        </button>
                    ))}
                    </div>
                    <div className="space-y-2 mt-4">
                        <Label htmlFor="custom-image-url" className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/20">Ou cole a URL de uma imagem</Label>
                        <Input 
                            id="custom-image-url"
                            placeholder="https://images.unsplash.com/..."
                            value={customImageUrl}
                            onChange={handleCustomUrlChange}
                            className="h-11 rounded-xl border-2 border-[#2D241E]/5 bg-white font-bold focus:ring-[#ff6b7b]/20 transition-all text-xs"
                        />
                        <input type="hidden" name="imageUrl" value={selectedImage} />
                        {state?.errors?.imageUrl && (
                          <p className="text-xs font-bold text-destructive italic">{state.errors.imageUrl[0]}</p>
                        )}
                    </div>
                </div>
            </div>
            <DialogFooter className="p-8 bg-white/50 border-t border-[#2D241E]/5">
            <Button type="submit" disabled={isPending || !name.trim()} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs bg-gradient-to-r from-[#ff6b7b] to-[#ff8e9a] text-white shadow-xl shadow-[#ff6b7b]/20 border-none hover:shadow-[#ff6b7b]/40 transition-all">
              {isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
