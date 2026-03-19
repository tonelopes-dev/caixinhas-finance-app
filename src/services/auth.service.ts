import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { CategoryService } from './category.service'; // Importar o CategoryService

export type UserWithoutPassword = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  workspaceImageUrl: string | null;
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
      
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      
      // ⚡ TRATAMENTO DE ERRO: Caso o banco esteja inacessível
      if (error.message?.includes('Can\'t reach database server')) {
        throw new Error('Banco de dados inacessível. Verifique se o Docker está rodando e a porta no .env está correta.');
      }
      
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
      
      console.log('🔍 Debug Register - trialExpiresAt:', trialExpiresAt);

      // Criar usuário
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          avatarUrl: data.avatarUrl || `https://caixinhas-finance-app.s3.us-east-1.amazonaws.com/logo-caixinhas.png`,
          subscriptionStatus: 'trial',
          trialExpiresAt: trialExpiresAt,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          workspaceImageUrl: true,
          subscriptionStatus: true,
          trialExpiresAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      console.log('✅ Debug Register - Usuario criado:', {
        id: user.id,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus,
        trialExpiresAt: user.trialExpiresAt
      });

      // Criar categorias padrão para o novo usuário
      await CategoryService.createDefaultCategoriesForUser(user.id, tx);

      // Criar cofre compartilhado padrão para o usuário
      const defaultVault = await tx.vault.create({
        data: {
          name: `Cofre de ${user.name}`,
          imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04421cd6c3?w=800',
          isPrivate: false,
          ownerId: user.id,
        },
      });

      // Adicionar o usuário como membro do cofre
      await tx.vaultMember.create({
        data: {
          userId: user.id,
          vaultId: defaultVault.id,
          role: 'owner',
        },
      });

      console.log('✅ Debug Register - Cofre padrão criado:', {
        vaultId: defaultVault.id,
        vaultName: defaultVault.name,
        isPrivate: defaultVault.isPrivate
      });

      // Vincular convites pendentes por e-mail
      await tx.invitation.updateMany({
        where: { receiverEmail: data.email, status: 'pending' },
        data: { receiverId: user.id, receiverEmail: null }
      });

      return user;
    }).catch(error => {
        console.error('Erro ao registrar usuário e criar categorias:', error);
        // Lançar o erro original para ser tratado no nível superior
        throw error;
    });
  }

  /**
   * Busca um usuário por ID (incluindo a senha para verificação)
   * @param id - ID do usuário
   * @returns Usuário completo ou null
   */
  static async getUserWithPassword(id: string) {
    try {
      return await prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error('Erro ao buscar usuário com senha:', error);
      return null;
    }
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
          workspaceImageUrl: true,
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
          workspaceImageUrl: true,
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
    data: { name?: string; avatarUrl?: string; workspaceImageUrl?: string }
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
          workspaceImageUrl: true,
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
    if (user.subscriptionStatus !== 'trial') {
      return false;
    }
    
    // Se não tem data de expiração mas é trial, corrige automaticamente
    if (!user.trialExpiresAt) {
      console.warn(`⚠️ Corrigindo trial sem data para usuário ${user.id}`);
      // Correção automática em background
      this.fixTrialExpirationDate(user.id).catch(console.error);
      return true; // Permite acesso enquanto corrige
    }
    
    return new Date(user.trialExpiresAt) > new Date();
  }

  /**
   * Corrige a data de expiração do trial para usuários afetados
   */
  static async fixTrialExpirationDate(userId: string): Promise<void> {
    try {
      const trialDuration = 21 * 24 * 60 * 60 * 1000; // 21 dias
      const trialExpiresAt = new Date(Date.now() + trialDuration);
      
      await prisma.user.update({
        where: { id: userId },
        data: { trialExpiresAt }
      });
      
      console.log(`✅ Trial corrigido para usuário ${userId}, expira em ${trialExpiresAt}`);
    } catch (error) {
      console.error('Erro ao corrigir trial:', error);
    }
  }

  /**
   * Gera e salva um novo token de Magic Link para o usuário
   * @param email - Email do usuário
   * @returns O token gerado ou null
   */
  static async generateMagicLinkToken(email: string): Promise<string | null> {
    try {
      const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

      await prisma.user.update({
        where: { email },
        data: {
          magicLinkToken: token,
          magicLinkExpires: expires,
        },
      });

      return token;
    } catch (error) {
      console.error('❌ Erro ao gerar Magic Link:', error);
      return null;
    }
  }

  /**
   * Valida um token de Magic Link e retorna o usuário
   * @param token - Token a ser validado
   * @returns Usuário ou null
   */
  static async validateMagicLinkToken(token: string): Promise<UserWithoutPassword | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { magicLinkToken: token },
      });

      if (!user) {
        console.log('❌ Magic Link - Token não encontrado');
        return null;
      }

      if (!user.magicLinkExpires || new Date(user.magicLinkExpires) < new Date()) {
        console.log('❌ Magic Link - Token expirado');
        return null;
      }

      // Limpa o token após o uso (segurança: token de uso único)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          magicLinkToken: null,
          magicLinkExpires: null,
        },
      });

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('❌ Erro ao validar Magic Link:', error);
      return null;
    }
  }
}
