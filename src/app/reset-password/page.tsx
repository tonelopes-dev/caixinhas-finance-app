'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
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
import { ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { resetPasswordAction } from '../forgot-password/actions';
import { motion, AnimatePresence } from 'framer-motion';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/forgot-password');
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      const result = await resetPasswordAction(token!, formData.password);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login?message=password-reset-success');
        }, 3000);
      } else {
        setError(result.message || 'Erro ao redefinir senha');
      }
    } catch (error) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (error) setError('');
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-primary/20 rounded-full animate-ping-slow" />
        <div className="absolute bottom-10 right-10 w-48 h-48 border-4 border-accent/20 rounded-full animate-ping-slow animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-primary/10 rounded-full animate-ping-slow animation-delay-500" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto w-full max-w-md relative z-10"
      >
        <Card className="rounded-[40px] border-2 border-primary/20 shadow-2xl backdrop-blur-xl bg-card/90 overflow-hidden">
          {success ? (
            <CardContent className="pt-20 pb-20 px-10 text-center space-y-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mx-auto h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-emerald-50 shadow-xl shadow-emerald-500/20"
                >
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                </motion.div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-headline font-black italic tracking-tight text-[#2D241E]">
                        Senha Alterada!
                    </h1>
                    <p className="text-sm font-medium text-[#2D241E]/50">
                        Sua segurança foi reestabelecida. Redirecionando você para o portal...
                    </p>
                </div>
                <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: "0%" }}
                        transition={{ duration: 3, ease: "linear" }}
                        className="h-full bg-emerald-500"
                    />
                </div>
            </CardContent>
          ) : (
            <>
              <CardHeader className="text-center pt-10 pb-6 px-8 relative">
                <div className="mx-auto mb-6 flex items-center justify-center">
                  <div className="p-4 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 rounded-3xl shadow-inner border border-white/40">
                    <Logo className="h-16 w-16 animate-float-logo" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-headline font-black italic tracking-tight text-[#2D241E] leading-tight text-balance">
                  Definir Nova Senha
                </CardTitle>
                <CardDescription className="text-sm font-medium text-[#2D241E]/50 mt-2 max-w-[280px] mx-auto">
                  Crie uma senha forte e segura para proteger seus sonhos.
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-8 space-y-6">
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="rounded-2xl bg-red-50 p-4 border border-red-100 text-center"
                    >
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-500">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" title="password" className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 8 caracteres"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        className="h-14 rounded-2xl border-primary/20 focus:border-primary focus:ring-primary/10 bg-white/60 text-base pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-12 w-12 p-0 rounded-xl hover:bg-transparent text-[#2D241E]/40"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" title="confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40 ml-1">Confirmar Senha</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Digite novamente"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        className="h-14 rounded-2xl border-primary/20 focus:border-primary focus:ring-primary/10 bg-white/60 text-base pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-12 w-12 p-0 rounded-xl hover:bg-transparent text-[#2D241E]/40"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <GradientButton 
                    type="submit" 
                    className="w-full h-14 group relative overflow-hidden mt-2" 
                    disabled={isLoading}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? 'Redefinindo...' : 'Atualizar Senha'}
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                  </GradientButton>
                </form>

                <div className="text-center pt-4 border-t border-[#2D241E]/5">
                  <Link 
                    href="/login"
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40 hover:text-[#ff6b7b] transition-all"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Voltar para o login
                  </Link>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fdfcf7] flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ff6b7b] border-t-transparent shadow-xl shadow-[#ff6b7b]/20" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}