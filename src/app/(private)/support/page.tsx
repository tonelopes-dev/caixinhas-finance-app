'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { toast } from '@/hooks/use-toast';
import { StandardBackButton } from '@/components/ui/standard-back-button';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, X, CheckCircle2 } from 'lucide-react';

export default function SupportPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
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
        body: formData,
      });

      if (response.ok) {
        setSubmitted(true);
        setMessage('');
        removeImage();
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
    <div className="pt-8 text-[#2D241E]">
      <div className="container max-w-4xl mx-auto py-12 px-6">
        <div className="mb-12">
          <StandardBackButton href="/dashboard" label="Voltar para o Painel" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-12"
        >
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-7xl font-headline font-bold text-[#2D241E] italic tracking-tight leading-tight">
              Precisa de <span className="text-[#ff6b7b]"> ajuda?</span> 🎧
            </h1>
            <p className="text-xl md:text-2xl text-[#2D241E]/60 font-medium italic max-w-2xl mx-auto">
              Envie uma mensagem para nossa equipe de suporte. Responderemos o mais breve possível.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/40 backdrop-blur-3xl rounded-[40px] border border-white/40 shadow-2xl p-8 md:p-12 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form 
                  key="support-form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  onSubmit={handleSubmit} 
                  className="grid gap-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-sm font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">Seu Nome</Label>
                      <Input 
                        id="name" 
                        type="text" 
                        defaultValue={session?.user?.name || ''} 
                        readOnly 
                        className="bg-white/60 border-white/40 rounded-2xl h-14 text-lg font-medium text-[#2D241E]/60 focus:ring-[#ff6b7b] focus:border-[#ff6b7b]"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">Seu E-mail</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        defaultValue={session?.user?.email || ''} 
                        readOnly 
                        className="bg-white/60 border-white/40 rounded-2xl h-14 text-lg font-medium text-[#2D241E]/60 focus:ring-[#ff6b7b] focus:border-[#ff6b7b]"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="message" className="text-sm font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">Mensagem</Label>
                    <Textarea
                      id="message"
                      placeholder="Descreva sua dúvida ou problema aqui..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={6}
                      className="bg-white/60 border-white/40 rounded-[30px] p-6 text-xl font-medium text-[#2D241E] focus:ring-[#ff6b7b] focus:border-[#ff6b7b] placeholder:text-[#2D241E]/20"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="image-upload" className="text-sm font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">Anexar Imagem (Opcional)</Label>
                    <div className="relative">
                      <div className="flex items-center justify-center border-2 border-dashed border-[#2D241E]/10 rounded-[30px] p-8 hover:border-[#ff6b7b]/30 transition-colors bg-white/20 select-none group">
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-2">
                          <ImageIcon className="h-10 w-10 text-[#2D241E]/20 group-hover:text-[#ff6b7b]/40 transition-colors" />
                          <p className="text-[#2D241E]/40 font-bold text-sm tracking-tight text-center">
                            Clique aqui ou arraste uma imagem <br />
                            <span className="font-medium opacity-60">(Máximo 5MB)</span>
                          </p>
                        </div>
                      </div>
                      
                      {imagePreview && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-6 flex flex-wrap gap-4"
                        >
                          <div className="relative group">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-40 h-40 rounded-[20px] object-cover shadow-xl border-4 border-white"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute -top-3 -right-3 bg-[#ff6b7b] text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/30 mt-3 text-center">
                              {imageFile?.name.substring(0, 15)}...
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <Button 
                      type="submit" 
                      disabled={loading || !message.trim()}
                      className="h-16 px-12 rounded-full bg-gradient-to-r from-[#ff6b7b] to-[#ff8a95] hover:from-[#ff5a6a] hover:to-[#ff7b88] text-white text-xl font-headline font-bold italic shadow-xl shadow-[#ff6b7b]/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="flex items-center gap-3">
                          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                           Enviando...
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Send className="h-5 w-5" />
                          Enviar Mensagem
                        </div>
                      )}
                    </Button>
                  </div>
                </motion.form>
              ) : (
                <motion.div 
                  key="success-message"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center space-y-8"
                >
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-headline font-bold text-[#2D241E] italic leading-tight">
                      Mensagem enviada <br />
                      <span className="text-[#ff6b7b]">com sucesso!</span>
                    </h2>
                    <p className="text-xl text-[#2D241E]/60 font-medium italic max-w-sm mx-auto">
                      Nossa equipe já recebeu seu contato e retornaremos em breve no seu e-mail.
                    </p>
                  </div>
                  <Button 
                    onClick={() => setSubmitted(false)}
                    variant="outline"
                    className="rounded-full h-14 px-8 border-[#2D241E]/10 hover:bg-[#2D241E]/5 font-bold uppercase tracking-widest text-xs"
                  >
                    Enviar outra mensagem
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
