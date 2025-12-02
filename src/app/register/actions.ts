"use server";

import { AuthService } from '@/services/auth.service';
import { CategoryService } from '@/services/category.service';
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
    const newUser = await AuthService.register({
      name,
      email,
      password,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    });

    // Adicionar categorias padrão para o novo usuário
    await createDefaultCategoriesForUser(newUser.id);

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

/**
 * Cria categorias padrão para um novo usuário
 */
async function createDefaultCategoriesForUser(userId: string): Promise<void> {
  const defaultCategories = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Roupas',
    'Tecnologia',
    'Serviços',
    'Outros'
  ];

  try {
    console.log(`🏷️ Criando categorias padrão para usuário ${userId}`);
    
    for (const categoryName of defaultCategories) {
      try {
        await CategoryService.createCategory(categoryName, userId);
        console.log(`✅ Categoria "${categoryName}" criada com sucesso`);
      } catch (error) {
        console.log(`⚠️ Categoria "${categoryName}" já existe ou erro ao criar:`, error);
      }
    }
    
    console.log(`🎉 Categorias padrão configuradas para usuário ${userId}`);
  } catch (error) {
    console.error('Erro ao criar categorias padrão:', error);
    // Não falha o registro se não conseguir criar categorias
  }
}
