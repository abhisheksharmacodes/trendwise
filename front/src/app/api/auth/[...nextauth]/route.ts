import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Extend the Session type to include our custom properties
declare module "next-auth" {
  interface Session {
    backendToken?: string;
    userId?: string;
    user: {
      image?: string;
    };
  }
}

// Extend the JWT type to include our custom properties
declare module "next-auth/jwt" {
  interface JWT {
    backendToken?: string;
    userId?: string;
    image?: string;
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        // Send user data to backend and get JWT
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              googleId: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            token.backendToken = data.token;
            token.userId = data.user.id;
            token.image = user.image ?? undefined;
          }
        } catch (error) {
          console.error('Error getting backend token:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.backendToken) {
        session.backendToken = token.backendToken;
        session.userId = token.userId;
      }
      if (token.image) {
        session.user.image = token.image;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST }; 