
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
        if (!credentials) {
            return null;
        }
        const user = await AuthService.login(credentials);
        
        if (user) {
          // Retorna o objeto do usuário completo para ser usado nos callbacks
          return user;
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
                        avatarUrl: user.image,
                        subscriptionStatus: 'trial',
                        trialExpiresAt: trialExpiresAt,
                    },
                });
                await CategoryService.createDefaultCategoriesForUser(newUser.id, tx);
            });
        }
      }
      return true;
    },

    async session({ session, token }) {
      // A estratégia JWT armazena o ID do usuário no `sub` do token.
      if (token.sub) {
        const dbUser = await AuthService.getUserById(token.sub);
        if (dbUser) {
          // Enriquece o objeto `session.user` com dados do banco de dados
          session.user = { ...session.user, ...dbUser };
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // (used for email-based verification)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
