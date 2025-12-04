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
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SupportPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromEmail: session.user.email,
          fromName: session.user.name || 'Usuário Caixinhas App',
          subject: "Mensagem de Suporte - Caixinhas App",
          message: message,
        }),
      });

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Sua mensagem foi enviada para o suporte. Retornaremos em breve!",
        });
        setMessage(''); // Limpa a mensagem após o envio
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
        <Button asChild variant="ghost" className="mb-4 w-fit">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Painel
          </Link>
        </Button>
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
