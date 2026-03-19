import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { AuthOptions } from 'next-auth';
// import GoogleProvider from 'next-auth/providers/google'; // TODO: Desabilitado até aprovação do Google OAuth
import CredentialsProvider from 'next-auth/providers/credentials';

import { prisma } from '@/services/prisma';
import { AuthService } from '@/services/auth.service';
import { CategoryService } from '@/services/category.service';

// Detecta automaticamente a URL base
const getBaseUrl = () => {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NODE_ENV === 'production' ? 'https://caixinhas.app' : 'http://localhost:9002';
};

export const authOptions: AuthOptions = {
  // ⚡ PERFORMANCE: Usar JWT ao invés de database sessions
  // Evita query no banco a cada verificação de sessão
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  
  // Adapter apenas para criar/atualizar usuários, não para sessões
  adapter: PrismaAdapter(prisma),
  
  providers: [
    // TODO: Google OAuth desabilitado temporariamente
    // Pendências (Ver docs/google-oauth-setup.md):
    // - Verificação do domínio no Google Search Console
    // - Atualização do OAuth Consent Screen
    // - Aprovação do Google
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        magicToken: { label: "Magic Token", type: "text" }
      },
      async authorize(credentials) {
        console.log('🔐 Authorize - Iniciando:', credentials?.email || 'Magic Link');
        
        // Se houver magicToken, autentica via token
        if (credentials?.magicToken) {
          console.log('✨ Authorize - Tentando login via Magic Link');
          const user = await AuthService.validateMagicLinkToken(credentials.magicToken);
          
          if (user) {
            console.log('✅ Authorize - Magic Link válido:', user.email);
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.avatarUrl || undefined
            };
          }
          console.log('❌ Authorize - Magic Link inválido ou expirado');
          return null;
        }

        if (!credentials?.email || !credentials?.password) {
            console.log('❌ Authorize - Credenciais inválidas ou faltando');
            return null;
        }
        
        try {
          const user = await AuthService.login({
            email: credentials.email,
            password: credentials.password
          });
          
          if (user) {
            console.log('✅ Authorize - Usuário autenticado:', user.email);
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.avatarUrl || undefined
            };
          }
          
          console.log('❌ Authorize - Login retornou null');
        } catch (error) {
          console.error('❌ Authorize - Erro:', error);
        }
        
        return null;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // TODO: Callback do Google OAuth comentado temporariamente
      // Descomentar quando Google OAuth for aprovado
      // if (account?.provider === 'google') {
      //   const userExists = await prisma.user.findUnique({
      //     where: { email: user.email! },
      //   });

      //   if (!userExists) {
      //       const trialExpiresAt = new Date();
      //       trialExpiresAt.setDate(trialExpiresAt.getDate() + 14);

      //       await prisma.$transaction(async (tx) => {
      //           const newUser = await tx.user.create({
      //               data: {
      //                   id: user.id,
      //                   name: user.name!,
      //                   email: user.email!,
      //                   password: Math.random().toString(36).slice(-8), // Senha aleatória para usuários Google
      //                   avatarUrl: user.image,
      //                   subscriptionStatus: 'trial',
      //                   trialExpiresAt: trialExpiresAt,
      //               },
      //           });
      //           await CategoryService.createDefaultCategoriesForUser(newUser.id, tx);

      //           // Vincular convites pendentes por e-mail
      //           await tx.invitation.updateMany({
      //               where: { receiverEmail: user.email!, status: 'pending' },
      //               data: { receiverId: newUser.id, receiverEmail: null }
      //           });
      //       });
      //   }
      // }
      return true;
    },

    async jwt({ token, user, account }) {
      // Quando o usuário faz login, adiciona o ID ao token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },

    async session({ session, token }) {
      // Adiciona informações do token à sessão
      if (token?.id) {
        const dbUser = await AuthService.getUserById(token.id as string);
        if (dbUser) {
          session.user = {
            ...dbUser,
            image: dbUser.avatarUrl || undefined,
            avatarUrl: dbUser.avatarUrl || undefined,
            workspaceImageUrl: dbUser.workspaceImageUrl || undefined
          };
        } else {
          // Se o usuário não existe mais no banco, invalida a sessão retornando null
          console.log('⚠️ Usuário não encontrado no banco (foi deletado), invalidando sessão');
          throw new Error('USER_NOT_FOUND');
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login', 
  },
  secret: process.env.NEXTAUTH_SECRET,
};
