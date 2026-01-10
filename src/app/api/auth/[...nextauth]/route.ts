import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from '@/lib/mongodb';
import AdminModel from '@/lib/models/Admin';

// Define authorized users with their roles
const AUTHORIZED_USERS = {
  'niyateshaukkalyan@gmail.com': 'super_admin',
  'sujeetgarud111@gmail.com': 'super_admin',
  'niyateshaukh.entry@gmail.com': 'super_admin',
} as const;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  
  callbacks: {
    async signIn({ user }) {
      // Only allow authorized users to sign in
      const userEmail = user.email?.toLowerCase();
      
      if (!userEmail || !(userEmail in AUTHORIZED_USERS)) {
        return false; // Reject unauthorized users
      }

      try {
        await connectDB();
        
        const role = AUTHORIZED_USERS[userEmail as keyof typeof AUTHORIZED_USERS];
        
        await AdminModel.findOneAndUpdate(
          { email: userEmail },
          {
            email: userEmail,
            name: user.name || 'Admin',
            role: role,
            lastLogin: new Date(),
          },
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error('DB error:', error instanceof Error ? error.message : String(error));
        // Still allow sign in even if DB update fails
      }

      return true;
    },

    async redirect({ url, baseUrl }) {
      // After successful sign in, redirect to homepage
      return baseUrl;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        const userEmail = user.email?.toLowerCase();
        token.role = userEmail && userEmail in AUTHORIZED_USERS 
          ? AUTHORIZED_USERS[userEmail as keyof typeof AUTHORIZED_USERS]
          : 'user';
      }
      return token;
    },
  },

  pages: {
    signIn: '/admin/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };