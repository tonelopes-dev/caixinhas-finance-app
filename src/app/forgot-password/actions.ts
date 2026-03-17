"use server";

import { AuthService } from '@/services/auth.service';
import { sendEmail } from '@/lib/email.service';
import crypto from 'crypto';
import { prisma } from '@/services/prisma';
import bcrypt from 'bcryptjs';

/**
 * Solicita reset de senha enviando email com token
 */
export async function requestPasswordResetAction(email: string) {
  try {
    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return {
        success: false,
        message: 'Por favor, insira um endereço de email válido.'
      };
    }
    
    // Verificar se o usuário existe
    const user = await AuthService.getUserByEmail(email);
    
    if (!user) {
      // Por segurança, não revelar se o email existe ou não
      return {
        success: true,
        message: 'Se o email existir em nossa base, você receberá as instruções de recuperação.'
      };
    }

    // Gerar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Salvar token no banco
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Enviar email com link de recuperação
    try {
      await sendPasswordResetEmail(email, user.name, resetToken);
    } catch (emailError) {
      console.error('Erro específico no envio de email:', emailError);
      // Remover o token se o email falhou
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null,
        },
      });
      
      return {
        success: false,
        message: 'Erro ao enviar email de recuperação. Por favor, verifique se seu endereço de email está correto e tente novamente.'
      };
    }

    return {
      success: true,
      message: 'Instruções de recuperação enviadas para seu email!'
    };
  } catch (error) {
    console.error('Erro ao solicitar reset de senha:', error);
    return {
      success: false,
      message: 'Erro interno do servidor. Tente novamente em alguns minutos.'
    };
  }
}

/**
 * Redefine a senha usando o token
 */
export async function resetPasswordAction(token: string, newPassword: string) {
  try {
    // Buscar usuário pelo token válido
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token ainda não expirou
        },
      },
    });

    if (!user) {
      return {
        success: false,
        message: 'Token inválido ou expirado. Solicite uma nova recuperação.'
      };
    }

    // Validar nova senha
    if (newPassword.length < 8) {
      return {
        success: false,
        message: 'A senha deve ter pelo menos 8 caracteres.'
      };
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Atualizar senha e limpar token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Enviar email de confirmação
    await sendPasswordChangedEmail(user.email, user.name);

    return {
      success: true,
      message: 'Senha redefinida com sucesso! Faça login com sua nova senha.'
    };
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return {
      success: false,
      message: 'Erro interno do servidor. Tente novamente.'
    };
  }
}

/**
 * Envia email de recuperação de senha
 */
async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:9002'}/reset-password?token=${token}`;
  
  const subject = 'Recuperação de Senha - Caixinhas App 🔐';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Recuperação de Senha 🔐</h2>
      
      <p>Olá <strong>${name}</strong>!</p>
      
      <p>Recebemos uma solicitação para redefinir a senha da sua conta no Caixinhas App.</p>
      
      <p>Clique no botão abaixo para criar uma nova senha:</p>
      
      <a href="${resetUrl}" 
         style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
        Redefinir Minha Senha
      </a>
      
      <p><strong>⚠️ IMPORTANTE:</strong></p>
      <ul>
        <li>Este link expira em 1 hora</li>
        <li>Se você não solicitou esta recuperação, ignore este email</li>
        <li>Por segurança, nunca compartilhe este link</li>
      </ul>
      
      <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
      <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${resetUrl}</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #6b7280;">
        Este email foi enviado automaticamente pelo sistema Caixinhas App. 
        Não responda este email.
      </p>
    </div>
  `;
  
  await sendEmail({ to: email, subject, html });
}

/**
 * Envia email de confirmação de alteração de senha
 */
async function sendPasswordChangedEmail(email: string, name: string) {
  const subject = 'Senha Alterada - Caixinhas App ✅';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Senha Alterada com Sucesso ✅</h2>
      
      <p>Olá <strong>${name}</strong>!</p>
      
      <p>Sua senha foi alterada com sucesso!</p>
      
      <p><strong>🛡️ Se você não fez esta alteração:</strong></p>
      <ul>
        <li>Entre em contato conosco imediatamente</li>
        <li>Verifique se sua conta não foi comprometida</li>
      </ul>
      
      <a href="${process.env.NEXTAUTH_URL || 'http://localhost:9002'}/login" 
         style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
        Fazer Login
      </a>
      
      <p>Obrigado por manter sua conta segura!</p>
    </div>
  `;
  
  await sendEmail({ to: email, subject, html });
}