import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

import { prisma } from '@/services/prisma';
import { AuthService } from '@/services/auth.service';
import { CategoryService } from '@/services/category.service';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔐 Authorize - Iniciando com credenciais:', credentials?.email);
        
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
              image: user.avatarUrl
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
      if (account?.provider === 'google') {
        const userExists = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!userExists) {
            const trialExpiresAt = new Date();
            trialExpiresAt.setDate(trialExpiresAt.getDate() + 14);

            await prisma.$transaction(async (tx) => {
                const newUser = await tx.user.create({
                    data: {
                        id: user.id,
                        name: user.name!,
                        email: user.email!,
                        password: Math.random().toString(36).slice(-8), // Senha aleatória para usuários Google
                        avatarUrl: user.image,
                        subscriptionStatus: 'trial',
                        trialExpiresAt: trialExpiresAt,
                    },
                });
                await CategoryService.createDefaultCategoriesForUser(newUser.id, tx);

                // Vincular convites pendentes por e-mail
                await tx.invitation.updateMany({
                    where: { receiverEmail: user.email!, status: 'pending' },
                    data: { receiverId: newUser.id, receiverEmail: null }
                });
            });
        }
      }
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
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            image: dbUser.avatarUrl,
            ...dbUser
          };
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
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
