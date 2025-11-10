"use server";

import { AuthService } from '@/services/auth.service';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(1, { message: 'O nome é obrigatório.' }),
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
  password: z.string().min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }),
});

export type RegisterState = {
  message?: string | null;
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
};

/**
 * Server Action para registrar novo usuário
 * @param prevState - Estado anterior
 * @param formData - Dados do formulário
 * @returns Estado atualizado com resultado do registro
 */
export async function registerAction(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const validatedFields = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Falha na validação. Por favor, verifique os campos.',
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    // Registrar usuário
    await AuthService.register({
      name,
      email,
      password,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    });

    // TODO: Enviar email de boas-vindas
    // await sendWelcomeEmail(email, name);

    // Redirecionar para login após registro bem-sucedido
  } catch (error: any) {
    console.error('Erro ao registrar usuário:', error);
    
    if (error.message === 'Este e-mail já está cadastrado') {
      return {
        message: 'Este e-mail já está cadastrado. Tente fazer login.',
        errors: { email: ['E-mail já cadastrado'] },
      };
    }

    return {
      message: 'Erro ao criar conta. Tente novamente.',
      errors: {},
    };
  }

  redirect('/login?registered=true');
}
