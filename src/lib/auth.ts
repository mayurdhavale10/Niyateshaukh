import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Helper function to check if user is super admin (has full access)
export function isAdmin(email: string | null | undefined): boolean {
  const normalizedEmail = email?.toLowerCase();
  return (
    normalizedEmail === 'niyateshaukkalyan@gmail.com' ||
    normalizedEmail === 'sujeetgarud111@gmail.com' ||
    normalizedEmail === 'niyateshaukh.entry@gmail.com' ||
    normalizedEmail === 'dhavalemayur746@gmail.com'
  );
}

// Helper function to check if user can scan (all admins can scan)
export function canScan(email: string | null | undefined): boolean {
  return isAdmin(email);
}

// Helper function to get user role
export function getUserRole(email: string | null | undefined): 'super_admin' | 'user' {
  return isAdmin(email) ? 'super_admin' : 'user';
}