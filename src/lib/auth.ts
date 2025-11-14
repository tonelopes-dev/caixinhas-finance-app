import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/services/prisma";

export const authOptions: NextAuthOptions = {
  // Removendo PrismaAdapter quando usando JWT + Credentials
  // adapter: PrismaAdapter(prisma),
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // Credenciais (email/senha)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("🔍 Tentativa de login:", { email: credentials?.email });
        
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Credenciais faltando");
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          console.log("👤 Usuário encontrado:", user ? "Sim" : "Não");
          console.log("🔐 Tem senha:", user?.password ? "Sim" : "Não");

          if (!user || !user.password) {
            console.log("❌ Usuário não encontrado ou sem senha");
            return null;
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password, 
            user.password
          );

          console.log("🔑 Senha válida:", isValidPassword ? "Sim" : "Não");

          if (!isValidPassword) {
            console.log("❌ Senha inválida");
            return null;
          }

          console.log("✅ Login autorizado para:", user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatarUrl || undefined,
          };
        } catch (error) {
          console.error("❌ Erro na autenticação:", error);
          return null;
        }
      }
    })
  ],
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  callbacks: {
    async jwt({ token, user, account }) {
      console.log("🔄 JWT Callback:", { user: !!user, account: !!account });
      if (user) {
        console.log("🔄 JWT: Definindo token.id =", user.id);
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    
    async session({ session, token }) {
      console.log("📋 Session Callback:", { token: !!token });
      if (token && session.user) {
        console.log("📋 Session: token.id =", token.id);
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        console.log("📋 Session final:", session.user);
      }
      return session;
    },
  },
  
  pages: {
    signIn: "/login",
  },
  
  debug: process.env.NODE_ENV === "development",
};