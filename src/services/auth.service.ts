
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { CategoryService } from './category.service'; // Importar o CategoryService

export type UserWithoutPassword = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  subscriptionStatus: string;
  trialExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

/**
 * AuthService - Serviço de autenticação de usuários
 * Agora integrado com NextAuth para login/registro
 */
export class AuthService {
  /**
   * Autentica um usuário com email e senha
   * @param data - Credenciais de login
   * @returns Usuário autenticado (sem senha) ou null
   */
  static async login(data: LoginInput): Promise<UserWithoutPassword | null> {
    try {
      console.log('🔐 Login - Tentando login com email:', data.email);
      
      const user = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        console.log('❌ Login - Usuário não encontrado:', data.email);
        return null;
      }
      
      console.log('✅ Login - Usuário encontrado:', user.email);
      console.log('🔍 Login - Password hash exists:', !!user.password);

      // Verifica se a senha do usuário existe
      if (!user.password) {
        console.log('❌ Login - Usuário não tem senha definida (pode ser login social)');
        return null;
      }

      const isPasswordValid = await bcrypt.compare(data.password, user.password);
      console.log('🔍 Login - Senha válida:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('❌ Login - Senha incorreta');
        return null;
      }

      // Retorna o usuário sem a senha
      const { password, ...userWithoutPassword } = user;
      console.log('✅ Login - Login bem-sucedido para:', user.email);
      return userWithoutPassword;
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw new Error('Erro ao realizar login');
    }
  }

  /**
   * Registra um novo usuário e cria suas categorias padrão.
   * @param data - Dados do novo usuário
   * @returns Usuário criado (sem senha)
   */
  static async register(data: CreateUserInput): Promise<UserWithoutPassword> {
    // Usar uma transação para garantir que o usuário e as categorias sejam criados juntos
    return prisma.$transaction(async (tx) => {
      // Verificar se o email já existe
      const existingUser = await tx.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error('Este e-mail já está cadastrado');
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Define a data de expiração do trial
      const trialExpiresAt = new Date();
      trialExpiresAt.setDate(trialExpiresAt.getDate() + 30);

      // Criar usuário
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          avatarUrl: data.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
          subscriptionStatus: 'trial',
          trialExpiresAt: trialExpiresAt,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          subscriptionStatus: true,
          trialExpiresAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Criar categorias padrão para o novo usuário
      await CategoryService.createDefaultCategoriesForUser(user.id, tx);

      return user;
    }).catch(error => {
        console.error('Erro ao registrar usuário e criar categorias:', error);
        // Lançar o erro original para ser tratado no nível superior
        throw error;
    });
  }

  /**
   * Busca um usuário por ID
   * @param id - ID do usuário
   * @returns Usuário encontrado (sem senha) ou null
   */
  static async getUserById(id: string): Promise<UserWithoutPassword | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          subscriptionStatus: true,
          trialExpiresAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  }

  /**
   * Busca um usuário por email
   * @param email - Email do usuário
   * @returns Usuário encontrado (sem senha) ou null
   */
  static async getUserByEmail(email: string): Promise<UserWithoutPassword | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          subscriptionStatus: true,
          trialExpiresAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      return null;
    }
  }

  /**
   * Atualiza o status de assinatura do usuário
   * @param userId - ID do usuário
   * @param status - Novo status da assinatura
   */
  static async updateSubscriptionStatus(
    userId: string,
    status: 'active' | 'inactive' | 'trial'
  ): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { subscriptionStatus: status },
      });
    } catch (error) {
      console.error('Erro ao atualizar status de assinatura:', error);
      throw new Error('Erro ao atualizar status de assinatura');
    }
  }

  /**
   * Atualiza dados do perfil do usuário
   * @param userId - ID do usuário
   * @param data - Dados a serem atualizados
   */
  static async updateProfile(
    userId: string,
    data: { name?: string; avatarUrl?: string }
  ): Promise<UserWithoutPassword> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          subscriptionStatus: true,
          trialExpiresAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw new Error('Erro ao atualizar perfil');
    }
  }

  /**
   * Verifica se o usuário tem um trial ativo
   * @param user - Objeto do usuário
   * @returns true se o trial for válido
   */
  static isTrialActive(user: UserWithoutPassword): boolean {
    if (user.subscriptionStatus !== 'trial' || !user.trialExpiresAt) {
      return false;
    }
    return new Date(user.trialExpiresAt) > new Date();
  }
}
