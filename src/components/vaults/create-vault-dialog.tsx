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
import { X, ChevronRight, ChevronLeft, Globe, Lock, Image as ImageIcon, Wallet, Check } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { VaultCreationSuccessDialog } from './vault-creation-success-dialog';
import { createVaultAction } from '@/app/vaults/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { compressImage } from '@/lib/image-utils';

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
  const [step, setStep] = useState(1);
  const [vaultName, setVaultName] = useState('');
  const [selectedPresetImage, setSelectedPresetImage] = useState<string | null>(coverImages[0]);
  const [isPrivate, setIsPrivate] = useState(false);

  const [localImageFile, setLocalImageFile] = useState<File | null>(null);
  const [localImagePreviewUrl, setLocalImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  const [direction, setDirection] = useState(0);
  const [canSubmit, setCanSubmit] = useState(false);
  
  const [state, formAction, isPending] = useActionState(createVaultAction, {
    message: null,
  });

  // Proteção contra clique duplo na transição para o Passo 3
  React.useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => setCanSubmit(true), 500);
      return () => clearTimeout(timer);
    } else {
      setCanSubmit(false);
    }
  }, [step]);

  const displayImageUrl = localImagePreviewUrl || selectedPresetImage;

  const resetForm = () => {
    setStep(1);
    setVaultName('');
    setSelectedPresetImage(coverImages[0]);
    setLocalImageFile(null);
    setLocalImagePreviewUrl(null);
    setIsPrivate(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      onOpenChange(false);
      setTimeout(resetForm, 300);
    } else {
      onOpenChange(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (step < 3) {
      nextStep();
      return;
    }

    if (!canSubmit || isPending) return;

    const formData = new FormData(e.currentTarget);
    
    if (localImageFile) {
      formData.set('imageFile', localImageFile);
      formData.delete('imageUrl');
    }
    
    React.startTransition(() => {
      formAction(formData);
    });
  };

  React.useEffect(() => {
    if (state?.message && !state?.errors) {
      toast({
        title: 'Sucesso',
        description: state.message,
      });
      
      // Primeiro atualizamos os dados, depois abrimos o feedback de sucesso
      React.startTransition(() => {
        router.refresh();
      });
      
      setTimeout(() => {
        handleClose(false);
        setSuccessModalOpen(true);
      }, 150);
    } else if (state?.errors) {
      toast({
        title: 'Erro',
        description: state.message || 'Erro ao criar cofre',
        variant: 'destructive',
      });
    }
  }, [state, toast, router]);
  
  const handlePresetImageSelection = (imageUrl: string) => {
    setSelectedPresetImage(imageUrl);
    setLocalImageFile(null);
    setLocalImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      try {
        const compressed = await compressImage(file);
        setLocalImageFile(compressed);
        setLocalImagePreviewUrl(URL.createObjectURL(compressed));
        setSelectedPresetImage(null);
      } catch (error) {
        console.error('Erro ao comprimir imagem:', error);
        // Fallback para o arquivo original se falhar
        setLocalImageFile(file);
        setLocalImagePreviewUrl(URL.createObjectURL(file));
        setSelectedPresetImage(null);
      }
    } else {
      setLocalImageFile(null);
      setLocalImagePreviewUrl(null);
    }
  }

  const nextStep = () => {
    if (step >= 3) return; 
    if (step === 1 && !vaultName.trim()) {
      toast({
        title: "Nome necessário",
        description: "Por favor, dê um nome ao seu cofre para continuar.",
        variant: "destructive"
      });
      return;
    }
    setDirection(1);
    setStep(s => s + 1);
  };

  const prevStep = () => {
    if (step <= 1) return;
    setDirection(-1);
    setStep(s => s - 1);
  };

  const stepVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
      scale: 0.95
    })
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Criar Novo Cofre - Passo {step}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
            <input type="hidden" name="userId" value={currentUser.id} />
            <input type="hidden" name="isPrivate" value={isPrivate.toString()} />
            {/* Garantir que o nome esteja sempre no FormData, mesmo que o step 1 saia do DOM */}
            {step !== 1 && <input type="hidden" name="name" value={vaultName} />}
            {!localImageFile && (
              <input type="hidden" name="imageUrl" value={selectedPresetImage ?? ''} />
            )}

            {/* Header com Progresso */}
            <div className="relative h-2 w-full bg-muted">
              <motion.div 
                className="absolute h-full bg-primary"
                initial={{ width: "33%" }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Conteúdo do Step */}
            <div className="flex-1 overflow-y-auto min-h-[400px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  className="p-8 space-y-6"
                >
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                          <Wallet className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">O que vamos guardar?</h2>
                        <p className="text-muted-foreground">Dê um nome bem legal para o seu cofre. Assim fica fácil de lembrar!</p>
                      </div>

                      <div className="space-y-4 pt-4">
                        <Label htmlFor="vault-name" className="text-base font-semibold">Nome do Cofre</Label>
                        <Input
                          id="vault-name"
                          name="name"
                          autoFocus
                          value={vaultName}
                          onChange={(e) => setVaultName(e.target.value)}
                          placeholder="Ex: Reforma da Casa, Viagem, Casamento..."
                          className="text-xl py-6 rounded-xl border-2 focus:border-primary transition-all shadow-sm"
                          required
                        />
                        <div className="bg-primary/10 p-4 rounded-xl flex gap-3 items-start border border-primary/20">
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-primary">TIP</span>
                          </div>
                          <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                            Use nomes que te motivem! Em vez de "Poupança", tente "Meu Primeiro Apê" 🏠
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                          <ImageIcon className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Deixe com a sua cara</h2>
                        <p className="text-muted-foreground">Escolha uma imagem que combine com seu sonho.</p>
                      </div>

                      <div className="space-y-6">
                        {/* Preview atual */}
                        <div className="relative h-40 w-full overflow-hidden rounded-2xl border-4 border-background shadow-xl">
                          {displayImageUrl ? (
                            <Image src={displayImageUrl} alt="Preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, 500px" />
                          ) : (
                            <div className="bg-gradient-to-br from-primary to-accent h-full w-full" />
                          )}
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <p className="text-white font-bold text-lg truncate">{vaultName}</p>
                          </div>
                        </div>

                        {/* Opções */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold">Escolha uma das nossas fotos:</Label>
                          <div className="grid grid-cols-3 gap-3">
                            {coverImages.map(imgSrc => (
                              <button 
                                type="button" 
                                key={imgSrc} 
                                onClick={() => handlePresetImageSelection(imgSrc)} 
                                className={cn(
                                  'relative h-20 w-full overflow-hidden rounded-xl border-2 transition-all hover:scale-105', 
                                  selectedPresetImage === imgSrc && !localImageFile 
                                    ? 'border-primary ring-4 ring-primary/20 scale-105' 
                                    : 'border-transparent opacity-70 hover:opacity-100'
                                )}
                              >
                                <Image src={imgSrc} alt="Capa" fill className="object-cover" sizes="150px" />
                                {selectedPresetImage === imgSrc && !localImageFile && (
                                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                    <Check className="w-6 h-6 text-white bg-primary rounded-full p-1" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-muted" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Ou</span>
                          </div>
                        </div>

                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full py-6 border-dashed border-2 rounded-xl group hover:border-primary transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImageIcon className="mr-2 h-5 w-5 text-muted-foreground group-hover:text-primary" />
                          {localImageFile ? localImageFile.name : 'Usar minha própria foto'}
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
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6 text-center">
                      <div className="space-y-2 text-left">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                          <Lock className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Quem pode ver?</h2>
                        <p className="text-muted-foreground">Escolha como prefere manter este cofre.</p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 pt-4">
                        <button
                          type="button"
                          onClick={() => setIsPrivate(false)}
                          className={cn(
                            "flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all",
                            !isPrivate ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/30"
                          )}
                        >
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                            !isPrivate ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                          )}>
                            <Globe className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-lg">Cofre em Conjunto</p>
                            <p className="text-sm text-muted-foreground">Você poderá convidar outras pessoas para economizarem juntas. Ideal para casais e famílias!</p>
                          </div>
                          {!isPrivate && <Check className="w-5 h-5 text-primary shrink-0 self-center" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsPrivate(true)}
                          className={cn(
                            "flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all",
                            isPrivate ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/30"
                          )}
                        >
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                            isPrivate ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                          )}>
                            <Lock className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-lg">Cofre Privado</p>
                            <p className="text-sm text-muted-foreground">Apenas você terá acesso a este cofre. Seus sonhos, sua privacidade total.</p>
                          </div>
                          {isPrivate && <Check className="w-5 h-5 text-primary shrink-0 self-center" />}
                        </button>
                      </div>

                      <div className="pt-6">
                        <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20 flex flex-col items-center gap-2">
                          <p className="text-sm font-medium">Tudo pronto!</p>
                          <p className="text-xs text-foreground/80 font-medium">Clique no botão abaixo para criar seu cofre e começar a poupar.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer com Navegação */}
            <div className="p-6 bg-muted/30 border-t flex gap-3">
              {step > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                  className="h-14 px-6 rounded-xl font-bold"
                >
                  <ChevronLeft className="mr-2 h-5 w-5" />
                  Voltar
                </Button>
              )}
              
              <Button 
                type={step === 3 ? "submit" : "button"} 
                onClick={step === 3 ? undefined : nextStep}
                disabled={isPending || (step === 3 && !canSubmit)}
                className="flex-1 h-14 text-lg font-bold rounded-xl gradient-button text-white border-none"
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Criando...</span>
                  </div>
                ) : (
                  <>
                    {step === 3 ? 'Finalizar e Criar Cofre' : 'Continuar'}
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Botão fechar flutuante se no step 1 (opcional, já temos o DialogClose padrão mas vamos deixar um bonito) */}
          <button 
            type="button"
            onClick={() => handleClose(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground transition-colors md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogContent>
      </Dialog>
      <VaultCreationSuccessDialog open={isSuccessModalOpen} onOpenChange={setSuccessModalOpen} />
    </>
  );
}
