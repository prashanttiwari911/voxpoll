import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "MOCK_GOOGLE_CLIENT_ID",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "MOCK_GOOGLE_CLIENT_SECRET",
    }),
    CredentialsProvider({
      name: "Developer Login",
      credentials: {
        email: { label: "Email", type: "text" },
        name: { label: "Name", type: "text" },
        age: { label: "Age", type: "text" },
        address: { label: "Address", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        // Try to find the user in our local SQLite DB
        let user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        const parsedAge = credentials.age ? parseInt(credentials.age, 10) : null;

        if (!user) {
          // If the user doesn't exist, let's sign them up as a new user!
          user = await db.user.create({
            data: {
              email: credentials.email,
              name: credentials.name || "Demo User",
              age: parsedAge,
              address: credentials.address || "Localhost",
            },
          });
        } else {
          // If they exist, let's update their details based on the form input
          const updateData: { age?: number | null; address?: string | null; name?: string | null } = {};
          if (credentials.age) updateData.age = parsedAge;
          if (credentials.address) updateData.address = credentials.address;
          if (credentials.name) updateData.name = credentials.name;

          user = await db.user.update({
            where: { id: user.id },
            data: updateData,
          });
        }

        // Return a standard NextAuth user object
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${user.name || "user"}&backgroundColor=b6e3f4,c0aade,d1d4f9`,
          age: user.age,
          address: user.address,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.age = user.age;
        token.address = user.address;
      } else if (token?.email) {
        // Query the database to retrieve latest age and address details
        const dbUser = await db.user.findUnique({
          where: { email: token.email },
          select: { id: true, age: true, address: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.age = dbUser.age;
          token.address = dbUser.address;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.age = token.age;
        session.user.address = token.address;
      }
      return session;
    },
  },
  pages: {
    signIn: "/", // Home page acts as our sign in portal
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
