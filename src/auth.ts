import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { FirestoreAdapter } from '@auth/firebase-adapter';
import { firestore } from '@/firebase/admin';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: FirestoreAdapter(firestore),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
});
