"use server";

import { AuthService } from '@/services/auth.service';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type LoginState = {
  message?: string | null;
  errors?: {
    email?: string[];
    password?: string[];
  };
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

/**
 * Server Action para realizar login
 * @param prevState - Estado anterior
 * @param formData - Dados do formulário
 * @returns Estado atualizado com resultado do login
 */
export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Validação básica
  if (!email || !email.includes('@')) {
    return {
      errors: { email: ['Por favor, insira um e-mail válido.'] },
      message: 'Dados inválidos',
    };
  }

  if (!password || password.length < 6) {
    return {
      errors: { password: ['A senha deve ter pelo menos 6 caracteres.'] },
      message: 'Dados inválidos',
    };
  }

  try {
    // Buscar usuário pelo email
    const user = await AuthService.getUserByEmail(email);

    if (!user) {
      return {
        message: 'E-mail ou senha inválidos.',
        errors: {},
      };
    }

    // TODO: Validar senha quando implementarmos autenticação completa
    // Por enquanto, aceita qualquer senha para usuários existentes no banco

    // Definir cookie de sessão
    const cookieStore = await cookies();
    cookieStore.set('CAIXINHAS_USER_ID', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    });

    return {
      message: 'Login realizado com sucesso!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return {
      message: 'Erro ao realizar login. Tente novamente.',
      errors: {},
    };
  }
}

/**
 * Server Action para realizar logout
 */
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('CAIXINHAS_USER_ID');
  redirect('/login');
}
