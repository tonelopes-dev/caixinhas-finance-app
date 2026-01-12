'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';

export default function SupportPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, envie apenas arquivos de imagem (JPG, PNG, GIF, WebP).",
        variant: "destructive",
      });
      e.target.value = '';
      return;
    }

    // Validar tamanho do arquivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "Por favor, envie uma imagem com no máximo 5MB.",
        variant: "destructive",
      });
      e.target.value = '';
      return;
    }

    setImageFile(file);
    
    // Criar preview da imagem
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    // Reset do input file
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!session?.user?.email) {
      toast({
        title: "Erro",
        description: "Não foi possível identificar seu e-mail. Por favor, faça login novamente.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // Usar FormData para enviar arquivo se houver
      const formData = new FormData();
      formData.append('fromEmail', session.user.email);
      formData.append('fromName', session.user.name || 'Usuário Caixinhas App');
      formData.append('subject', 'Mensagem de Suporte - Caixinhas App');
      formData.append('message', message);
      
      if (imageFile) {
        formData.append('attachment', imageFile);
      }

      const response = await fetch('/api/support', {
        method: 'POST',
        body: formData, // Não definir Content-Type para FormData
      });

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Sua mensagem foi enviada para o suporte. Retornaremos em breve!",
        });
        setMessage(''); // Limpa a mensagem após o envio
        removeImage(); // Limpa a imagem anexa
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro",
          description: errorData.error || "Ocorreu um erro ao enviar sua mensagem.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem de suporte:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado ao enviar sua mensagem.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto grid w-full max-w-4xl gap-2">
        <BackToDashboard />
        <h1 className="text-3xl font-semibold">Suporte</h1>
        <p className="text-muted-foreground">Envie uma mensagem para nossa equipe de suporte. Responderemos o mais breve possível.</p>
      </div>
      <div className="mx-auto w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Entrar em Contato</CardTitle>
            <CardDescription>Preencha o formulário abaixo para nos enviar sua dúvida ou problema.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Seu Nome</Label>
                <Input id="name" type="text" defaultValue={session?.user?.name || ''} readOnly />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Seu E-mail</Label>
                <Input id="email" type="email" defaultValue={session?.user?.email || ''} readOnly />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  placeholder="Descreva sua dúvida ou problema aqui..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image-upload">Anexar Imagem (Opcional)</Label>
                <div className="space-y-2">
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Envie uma captura de tela ou imagem para nos ajudar a entender melhor o problema. Máximo 5MB.
                  </p>
                  
                  {/* Preview da imagem */}
                  {imagePreview && (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview do anexo"
                        className="max-w-xs max-h-40 rounded-lg border object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={removeImage}
                      >
                        ×
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        {imageFile?.name} ({((imageFile?.size || 0) / 1024 / 1024).toFixed(1)} MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <CardFooter className="flex justify-end p-0 pt-6">
                <Button type="submit" disabled={loading || !message.trim()}>
                  {loading ? "Enviando..." : "Enviar Mensagem"}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
