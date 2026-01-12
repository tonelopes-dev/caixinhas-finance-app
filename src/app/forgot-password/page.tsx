'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { requestPasswordResetAction } from './actions';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [lastRequestTime, setLastRequestTime] = useState<number | null>(null);

  // Effect para controlar o cooldown
  useEffect(() => {
    // Verificar se há cooldown armazenado no localStorage
    const storedLastRequest = localStorage.getItem('forgot-password-last-request');
    if (storedLastRequest) {
      const lastRequestTime = parseInt(storedLastRequest);
      const timeDiff = Date.now() - lastRequestTime;
      const cooldownDuration = 60 * 1000; // 60 segundos
      
      if (timeDiff < cooldownDuration) {
        const remainingSeconds = Math.ceil((cooldownDuration - timeDiff) / 1000);
        setCooldownSeconds(remainingSeconds);
        setLastRequestTime(lastRequestTime);
      } else {
        // Limpar storage se o cooldown expirou
        localStorage.removeItem('forgot-password-last-request');
      }
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (cooldownSeconds > 0) {
      interval = setInterval(() => {
        setCooldownSeconds(prev => {
          if (prev <= 1) {
            // Limpar storage quando cooldown terminar
            localStorage.removeItem('forgot-password-last-request');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldownSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar se ainda está em cooldown
    if (cooldownSeconds > 0) {
      return;
    }
    
    // Validar email no frontend
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setError('❌ Por favor, insira um endereço de email válido.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await requestPasswordResetAction(email);
      
      if (result.success) {
        setMessage('📧 Instruções de recuperação enviadas para seu email! Verifique também sua caixa de spam.');
        // Iniciar cooldown de 60 segundos
        const currentTime = Date.now();
        setCooldownSeconds(60);
        setLastRequestTime(currentTime);
        localStorage.setItem('forgot-password-last-request', currentTime.toString());
      } else {
        setError(`❌ ${result.message || 'Erro ao enviar email de recuperação. Tente novamente em alguns instantes.'}`);
      }
    } catch (error: any) {
      console.error('Erro ao solicitar recuperação:', error);
      setError('❌ Erro interno do servidor. Por favor, tente novamente em alguns minutos. Se o problema persistir, entre em contato com o suporte.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="text-center">
          <Logo className="mx-auto h-12 w-12" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight font-headline">
            Recuperar Senha
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Digite seu email para receber instruções de recuperação
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Esqueceu a senha?</CardTitle>
            <CardDescription className="text-center">
              Não se preocupe, isso acontece. Digite seu email e enviaremos um link para redefinir sua senha.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message && (
              <div className="rounded-md bg-green-50 p-4 border border-green-200">
                <div className="flex">
                  <Mail className="h-5 w-5 text-green-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{message}</p>
                    <p className="text-xs text-green-700 mt-1">
                      💡 Dica: O email pode levar até 5 minutos para chegar. Se não receber, verifique sua caixa de spam.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || cooldownSeconds > 0}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Enviando...
                  </>
                ) : cooldownSeconds > 0 ? (
                  <>
                    🕐 Aguarde {cooldownSeconds}s para enviar novamente
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Email de Recuperação
                  </>
                )}
              </Button>
            </form>

            <div className="text-center">
              <Link 
                href="/login"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Voltar para o login
              </Link>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">🛡️ Dicas de Segurança:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• O link de recuperação expira em 1 hora</li>
                <li>• Use uma senha forte com pelo menos 8 caracteres</li>
                <li>• Nunca compartilhe seus dados de login</li>
                <li>• Se você não solicitou esta recuperação, ignore este email</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}