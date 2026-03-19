'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import { requestPasswordResetAction } from './actions';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    const storedLastRequest = localStorage.getItem('forgot-password-last-request');
    if (storedLastRequest) {
      const lastRequestTime = parseInt(storedLastRequest);
      const timeDiff = Date.now() - lastRequestTime;
      const cooldownDuration = 60 * 1000;
      
      if (timeDiff < cooldownDuration) {
        const remainingSeconds = Math.ceil((cooldownDuration - timeDiff) / 1000);
        setCooldownSeconds(remainingSeconds);
      } else {
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
            localStorage.removeItem('forgot-password-last-request');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [cooldownSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownSeconds > 0) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setError('Por favor, insira um endereço de email válido.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await requestPasswordResetAction(email);
      if (result.success) {
        setMessage('Instruções enviadas! Verifique seu e-mail (e a caixa de spam).');
        const currentTime = Date.now();
        setCooldownSeconds(60);
        localStorage.setItem('forgot-password-last-request', currentTime.toString());
      } else {
        setError(result.message || 'Erro ao enviar e-mail. Tente novamente.');
      }
    } catch (error: any) {
      setError('Erro interno. Tente novamente em alguns minutos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-primary/20 rounded-full animate-ping-slow" />
        <div className="absolute bottom-10 right-10 w-48 h-48 border-4 border-accent/20 rounded-full animate-ping-slow animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-primary/10 rounded-full animate-ping-slow animation-delay-500" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-md relative z-10"
      >
        <Card className="rounded-[40px] border-2 border-primary/20 shadow-2xl backdrop-blur-xl bg-card/90 overflow-hidden">
          <CardHeader className="text-center pt-10 pb-6 px-8 relative">
            <div className="mx-auto mb-6 flex items-center justify-center">
              <div className="p-4 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 rounded-3xl shadow-inner border border-white/40">
                <Logo className="h-16 w-16 animate-float-logo" />
              </div>
            </div>
            <CardTitle className="text-3xl font-headline font-black italic tracking-tight text-[#2D241E] leading-tight">
              Recuperar Senha
            </CardTitle>
            <CardDescription className="text-sm font-medium text-[#2D241E]/50 mt-2 max-w-[280px] mx-auto">
              Digite seu e-mail e enviaremos um link para você voltar a sonhar.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8 space-y-6">
            <AnimatePresence mode="wait">
              {message ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl bg-emerald-50 p-6 border border-emerald-100 flex items-start gap-4"
                >
                  <Mail className="h-6 w-6 text-emerald-500 mt-1 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-emerald-800">{message}</p>
                    <p className="text-[10px] font-medium text-emerald-600">
                      💡 Dica: Verifique a pasta de lixo eletrônico.
                    </p>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl bg-red-50 p-4 border border-red-100 text-center"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-500">{error}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {!message && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">E-mail de Cadastro</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemplo@limite.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    required
                    disabled={isLoading}
                    className="h-14 rounded-2xl border-primary/20 focus:border-primary focus:ring-primary/10 bg-white/60 text-base"
                  />
                </div>

                <GradientButton 
                  type="submit" 
                  className="w-full h-14 group relative overflow-hidden" 
                  disabled={isLoading || cooldownSeconds > 0}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      'Solicitando...'
                    ) : cooldownSeconds > 0 ? (
                      `Aguarde ${cooldownSeconds}s`
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        Enviar Instruções
                      </>
                    )}
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                </GradientButton>
              </form>
            )}

            <div className="flex flex-col items-center gap-4 border-t border-[#2D241E]/5 pt-8">
              <Link 
                href="/login"
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40 hover:text-[#ff6b7b] transition-all"
              >
                <ArrowLeft className="h-3 w-3" />
                Voltar para o portal
              </Link>
            </div>
            
            <div className="p-5 bg-blue-50/50 border border-blue-100/50 rounded-3xl space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-900/60 flex items-center gap-2">
                <ShieldCheck className="h-3 w-3" /> 
                Dicas de Segurança
              </h4>
              <ul className="text-[10px] font-medium text-blue-800/70 space-y-1 ml-1 list-none">
                <li>• O link de recuperação expira em 60 minutos</li>
                <li>• Nunca compartilhe este e-mail com ninguém</li>
                <li>• Utilize uma senha única para o Caixinhas</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}