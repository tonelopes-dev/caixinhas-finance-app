'use client';

import { changePasswordAction } from '@/app/(private)/profile/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/definitions';
import { Eye, EyeOff, Key, Loader2, Shield } from 'lucide-react';
import { useState } from 'react';

interface PasswordManagementProps {
  currentUser: User;
}

export function PasswordManagement({ currentUser }: PasswordManagementProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validações
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      toast({
        title: 'Erro',
        description: 'A nova senha deve ter pelo menos 8 caracteres',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await changePasswordAction(
        currentUser.id,
        formData.currentPassword,
        formData.newPassword
      );

      if (result.success) {
        toast({
          title: 'Sucesso',
          description: 'Senha alterada com sucesso!',
        });
        
        // Limpar formulário
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast({
          title: 'Erro',
          description: result.message || 'Erro ao alterar senha',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPasswordReset = async () => {
    try {
      const { requestPasswordResetAction } = await import('../../app/forgot-password/actions');
      const result = await requestPasswordResetAction(currentUser.email);
      
      if (result.success) {
        toast({
          title: 'Email Enviado',
          description: 'Instruções de recuperação enviadas para seu email!',
        });
      } else {
        toast({
          title: 'Erro',
          description: result.message || 'Erro ao enviar email',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[40px] bg-white/40 backdrop-blur-3xl border border-white/60 shadow-[0_20px_50px_rgba(45,36,30,0.06)] transition-all duration-500">
      <div className="p-8 md:p-10 space-y-2 border-b border-[#2D241E]/5 bg-white/30">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-[#ff6b7b]/10 p-3 shadow-inner">
            <Shield className="h-6 w-6 text-[#ff6b7b]" />
          </div>
          <div>
            <h2 className="text-3xl font-headline font-bold text-[#2D241E] italic">Segurança da <span className="text-[#ff6b7b]">Conta</span></h2>
            <p className="text-xs font-medium text-[#2D241E]/40 italic">Gerencie sua senha para manter sua conta segura e privada.</p>
          </div>
        </div>
      </div>
      <div className="p-8 md:p-10 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="currentPassword" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40 ml-1">Senha Atual</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Digite sua senha atual"
                className="h-14 rounded-2xl border-2 border-[#2D241E]/5 bg-white text-lg font-bold text-[#2D241E] focus:border-[#ff6b7b] focus:ring-0 transition-all shadow-sm"
                value={formData.currentPassword}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                disabled={isLoading}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={isLoading}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Digite a nova senha novamente"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-gradient-to-br from-[#ff6b7b] to-[#fa8292] text-white shadow-xl shadow-[#ff6b7b]/20 border-none hover:shadow-2xl hover:shadow-[#ff6b7b]/30 transition-all duration-300 active:scale-[0.98]">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Alterando...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                Alterar Senha
              </>
            )}
          </Button>
        </form>

        <div className="pt-8 border-t border-[#2D241E]/5">
          <div className="flex flex-col gap-3">
            <h4 className="text-xl font-headline font-bold text-[#2D241E] italic">Esqueceu sua senha?</h4>
            <p className="text-sm font-medium text-[#2D241E]/40 italic">
              Receba um link de recuperação por e-mail se não lembrar o acesso atual.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleRequestPasswordReset}
              className="w-fit h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] border-[#2D241E]/10 text-[#2D241E]/60 hover:bg-[#ff6b7b]/5 hover:text-[#ff6b7b] hover:border-[#ff6b7b]/20 transition-all"
            >
              Enviar Email de Recuperação
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}