
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { AuthService, type LoginInput } from "@/services/auth.service";

export const authOptions: NextAuthOptions = {
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
        console.log("🔍 Tentativa de login via NextAuth:", { email: credentials?.email });
        
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Credenciais faltando");
          return null;
        }

        try {
          const user = await AuthService.login({
            email: credentials.email,
            password: credentials.password
          });
          
          if (user) {
            console.log("✅ Login autorizado para:", user.email);
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.avatarUrl || undefined,
            };
          }

          console.log("❌ Usuário não autorizado pelo AuthService");
          return null;
          
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
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  
  pages: {
    signIn: "/login",
  },
  
  debug: process.env.NODE_ENV === "development",
};
