
'use client';

import React, { useEffect } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { User } from '@/lib/definitions';
import { updateProfileAction, type ProfileActionState } from '@/app/(private)/profile/actions';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useState, useRef } from 'react';

// Avatares padrão baseados em iniciais e ícones financeiros
const generateAvatarUrl = (text: string, bgColor: string, textColor: string = 'white') => 
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="${bgColor}"/><text x="50" y="65" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="${textColor}">${text}</text></svg>`)}`;

// Emojis de pessoas (adultos e jovens)
// Emoji único de pessoa
const avatarEmoji = '👤';

// Cores em tons pastéis (azul, verde, amarelo e rosa)
const pastelColors = [
  '#E3F2FD', // Azul pastel
  '#E8F5E8', // Verde pastel
  '#FFF9C4', // Amarelo pastel
  '#FCE4EC'  // Rosa pastel
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-gradient-to-br from-[#ff6b7b] to-[#fa8292] text-white shadow-xl shadow-[#ff6b7b]/20 border-none hover:shadow-2xl hover:shadow-[#ff6b7b]/30 transition-all duration-300 active:scale-[0.98]"
    >
      {pending ? 'Salvando...' : 'Salvar Alterações'}
    </Button>
  );
}

const colorOptions = [
  { name: 'Azul', value: '#87CEEB' },
  { name: 'Verde', value: '#98FB98' },
  { name: 'Amarelo', value: '#F0E68C' },
  { name: 'Rosa', value: '#FFB6C1' }
];

export function ProfileForm({ user, onProfileUpdate }: { user: User; onProfileUpdate?: () => Promise<void> }) {
  const { toast } = useToast();
  const initialState: ProfileActionState = { message: null, errors: {} };
  const [state, formAction] = useActionState(updateProfileAction, initialState);
  const [selectedEmoji, setSelectedEmoji] = useState('👤');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value);
  const [selectedImage, setSelectedImage] = useState(user.avatarUrl || generateAvatarUrl('👤', colorOptions[0].value, '#333'));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const processedStateRef = useRef<string | null>(null);

  useEffect(() => {
    // Previne processamento duplicado do mesmo state
    if (state.message && processedStateRef.current !== state.message) {
      processedStateRef.current = state.message;
      
      if (!state.errors) {
        toast({
          title: "Sucesso!",
          description: state.message,
        });
        // Atualizar os dados do perfil após sucesso
        if (onProfileUpdate) {
          onProfileUpdate();
        }
      } else {
        toast({
          title: "Erro de Validação",
          description: state.message,
          variant: "destructive",
        });
      }
    }
  }, [state, toast, onProfileUpdate]);

  return (
    <div className="relative overflow-hidden rounded-[40px] bg-white/40 backdrop-blur-3xl border border-white/60 shadow-[0_20px_50px_rgba(45,36,30,0.06)] transition-all duration-500">
      <form action={formAction}>
        <div className="p-8 md:p-10 space-y-2 border-b border-[#2D241E]/5 bg-white/30">
          <h2 className="text-3xl font-headline font-bold text-[#2D241E] italic">Informações <span className="text-[#ff6b7b]">Pessoais</span></h2>
          <p className="text-xs font-medium text-[#2D241E]/40 italic">Mantenha seus dados sempre atualizados para um porto seguro.</p>
        </div>
        <div className="p-8 md:p-10">
          <div className="grid gap-4">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-8 pb-10 border-b border-[#2D241E]/5 items-center">
                {/* Preview Container */}
                <div className="flex flex-col items-center sm:flex-row gap-8">
                  <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl ring-8 ring-[#ff6b7b]/5 group-hover:ring-[#ff6b7b]/10 transition-all duration-500 shrink-0">
                    <Image
                      src={imagePreview || selectedImage}
                      alt="Profile preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10 transition-opacity opacity-0 hover:opacity-100 flex items-center justify-center">
                      <span className="text-white text-[10px] font-black uppercase tracking-widest">Preview</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <h3 className="text-xl font-headline font-bold text-[#2D241E] italic">Foto de Perfil</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/30 leading-relaxed italic">Personalize sua presença no app</p>
                  </div>
                </div>
                
                {/* Upload Area */}
                <div className="space-y-3">
                  <Label htmlFor="avatarFile" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40 ml-1">Upload de Imagem</Label>
                  <div className="relative">
                    <Input
                      id="avatarFile"
                      name="avatarFile"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImagePreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label
                      htmlFor="avatarFile"
                      className="flex flex-col items-center justify-center w-full h-32 md:h-40 border-2 border-dashed border-[#2D241E]/10 rounded-3xl cursor-pointer bg-white/50 hover:bg-white hover:border-[#ff6b7b]/30 transition-all duration-300 group shadow-sm"
                    >
                      <div className="flex flex-col items-center justify-center py-4">
                        <div className="w-10 h-10 rounded-full bg-[#ff6b7b]/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <svg
                            className="w-5 h-5 text-[#ff6b7b]/60"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 16"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                            />
                          </svg>
                        </div>
                        <p className="mb-1 text-[11px] font-bold text-[#2D241E]/60 text-center">
                          <span className="text-[#ff6b7b]">Clique para carregar</span> nova foto
                        </p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#2D241E]/20 text-center">
                          PNG, JPG (MAX. 5MB)
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              
              <input type="hidden" name="avatarUrl" value={imageFile ? '' : selectedImage} />
              
              <div className="space-y-4">
                <Label>Ou crie seu avatar personalizado</Label>
                
                {/* Avatar único com cores */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Escolha a cor do seu avatar:</Label>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{avatarEmoji}</div>
                    <div className="grid grid-cols-4 gap-2">
                      {colorOptions.map((color, index) => (
                        <div
                          key={index}
                          className={cn(
                            "w-12 h-12 cursor-pointer rounded-full border-2 transition-all flex items-center justify-center text-lg hover:scale-110 shadow-sm",
                            selectedColor === color.value && !imagePreview ? "border-primary ring-2 ring-primary ring-offset-1" : "border-gray-300 hover:border-gray-400"
                          )}
                          style={{ backgroundColor: color.value }}
                          onClick={() => {
                            setSelectedColor(color.value);
                            setSelectedEmoji(avatarEmoji);
                            const newAvatarUrl = generateAvatarUrl(avatarEmoji, color.value, '#333');
                            setSelectedImage(newAvatarUrl);
                            setImageFile(null);
                            setImagePreview(null);
                            const fileInput = document.getElementById('avatarFile') as HTMLInputElement;
                            if (fileInput) fileInput.value = '';
                          }}
                        >
                          {avatarEmoji}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
             
              </div>
              
              {/* Botão para limpar seleção customizada */}
              {imagePreview && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    const fileInput = document.getElementById('avatarFile') as HTMLInputElement;
                    if (fileInput) fileInput.value = '';
                  }}
                >
                  Remover imagem personalizada
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40 ml-1">Nome Completo</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={user.name} 
                className="h-14 rounded-2xl border-2 border-[#2D241E]/5 bg-white text-lg font-bold text-[#2D241E] focus:border-[#ff6b7b] focus:ring-0 transition-all shadow-sm"
              />
              {state?.errors?.name && <p className="text-xs text-[#ff6b7b] font-bold mt-1 ml-1">{state.errors.name[0]}</p>}
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40 ml-1">E-mail (Não alterável)</Label>
              <Input 
                id="email" 
                type="email" 
                defaultValue={user.email} 
                className="h-14 rounded-2xl border-2 border-[#2D241E]/5 bg-[#2D241E]/5 text-lg font-bold text-[#2D241E]/40 grayscale cursor-not-allowed transition-all"
                readOnly 
                disabled 
              />
            </div>
          </div>
        </div>
        <div className="p-8 md:p-10 border-t border-[#2D241E]/5 flex justify-end bg-white/30 backdrop-blur-sm">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
