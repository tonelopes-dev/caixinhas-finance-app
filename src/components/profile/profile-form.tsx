
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
import { updateProfileAction, type ProfileActionState } from '@/app/profile/actions';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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
    <Button type="submit" disabled={pending}>
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

export function ProfileForm({ user }: { user: User }) {
  const { toast } = useToast();
  const initialState: ProfileActionState = { message: null, errors: {} };
  const [state, formAction] = useActionState(updateProfileAction, initialState);
  const [selectedEmoji, setSelectedEmoji] = useState('👤');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value);
  const [selectedImage, setSelectedImage] = useState(user.avatarUrl || generateAvatarUrl('👤', colorOptions[0].value, '#333'));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (state.message && !state.errors) {
      toast({
        title: "Sucesso!",
        description: state.message,
      });
    } else if (state.message && state.errors) {
      toast({
        title: "Erro de Validação",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast]);

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>
            Mantenha seus dados sempre atualizados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="space-y-4">
              <Label>Foto de Perfil</Label>
              <div className="flex justify-center mb-4">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary">
                  <Image
                    src={imagePreview || selectedImage}
                    alt="Profile preview"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              
              {/* Upload de arquivo */}
              <div className="space-y-2">
                <Label htmlFor="avatarFile">Upload de Imagem Personalizada</Label>
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
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 group"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500 group-hover:text-gray-600"
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
                      <p className="mb-2 text-sm text-gray-500 group-hover:text-gray-600">
                        <span className="font-semibold">Clique para fazer upload</span>
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-gray-600">
                        PNG, JPG ou JPEG (MAX. 5MB)
                      </p>
                    </div>
                  </label>
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

            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" defaultValue={user.name} />
              {state?.errors?.name && <p className="text-sm text-destructive mt-1">{state.errors.name[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" defaultValue={user.email} readOnly disabled />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4 flex justify-end">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
