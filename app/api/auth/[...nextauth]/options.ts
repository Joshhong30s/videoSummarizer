import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';
import type { Session, User } from 'next-auth';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { GUEST_USER_ID } from '@/lib/supabase';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    CredentialsProvider({
      name: 'Guest',
      credentials: {},
      async authorize() {
        return {
          id: GUEST_USER_ID,
          email: 'guest@example.com',
          name: 'Guest',
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }: { user: User; account: any }) {
      if (account?.provider === 'credentials') {
        return true;
      }

      if (account?.provider !== 'google') return false;

      try {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (existingUser) {
          user.id = existingUser.id;
          return true;
        }

        const uuid = crypto.randomUUID();
        const { error } = await supabase.from('users').insert({
          id: uuid,
          email: user.email,
          name: user.name,
        });

        if (error) {
          console.error('Error saving user to Supabase:', error);
          return false;
        }

        user.id = uuid;
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session?.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
};
