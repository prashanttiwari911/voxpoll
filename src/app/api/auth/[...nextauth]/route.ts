import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth from "next-auth/next";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "MOCK_GOOGLE_CLIENT_ID",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "MOCK_GOOGLE_CLIENT_SECRET",
    }),
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST || "smtp.ethereal.email",
        port: Number(process.env.SMTP_PORT || 587),
        auth: {
          user: process.env.SMTP_USER || "test",
          pass: process.env.SMTP_PASS || "test",
        },
      },
      from: process.env.EMAIL_FROM || "noreply@voti.com",
      generateVerificationToken() {
        return Math.floor(100000 + Math.random() * 900000).toString();
      },
      async sendVerificationRequest({ identifier: email, url, token, provider }) {
        // If SMTP isn't fully configured, we still print to console for safety in dev
        console.log("\n=======================================================");
        console.log(`[VoTI] 🔑 YOUR LOGIN CODE FOR ${email} IS: ${token}`);
        console.log(`[VoTI] Or click this link: ${url}`);
        console.log("=======================================================\n");

        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
          const nodemailer = require("nodemailer");
          const transport = nodemailer.createTransport(provider.server);
          await transport.sendMail({
            to: email,
            from: provider.from,
            subject: `Your VoTI Login Code: ${token}`,
            text: `Your login code is ${token}\n\nYou can also click here to login: ${url}`,
            html: `
              <div style="font-family: sans-serif; max-w: 500px; margin: 0 auto; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-radius: 16px;">
                <h1 style="color: #4f46e5; margin-bottom: 8px;">VoTI</h1>
                <p style="color: #4b5563; font-size: 16px;">Here is your one-time login code:</p>
                <div style="font-size: 32px; font-weight: 900; letter-spacing: 4px; color: #111827; background: #f3f4f6; padding: 16px; border-radius: 12px; margin: 24px 0;">
                  ${token}
                </div>
                <p style="color: #6b7280; font-size: 14px;">Or you can <a href="${url}" style="color: #4f46e5; text-decoration: none; font-weight: bold;">click here to sign in automatically</a>.</p>
              </div>
            `,
          });
        }
      },
    }),
    CredentialsProvider({
      name: "Developer Login",
      credentials: {
        email: { label: "Email", type: "text" },
        name: { label: "Name", type: "text" },
        age: { label: "Age", type: "text" },
        address: { label: "Address", type: "text" },
        gender: { label: "Gender", type: "text" },
        occupation: { label: "Occupation", type: "text" },
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
              gender: credentials.gender || null,
              occupation: credentials.occupation || null,
            },
          });
        } else {
          // If they exist, let's update their details based on the form input
          const updateData: { age?: number | null; address?: string | null; name?: string | null; gender?: string | null; occupation?: string | null } = {};
          if (credentials.age) updateData.age = parsedAge;
          if (credentials.address) updateData.address = credentials.address;
          if (credentials.name) updateData.name = credentials.name;
          if (credentials.gender) updateData.gender = credentials.gender;
          if (credentials.occupation) updateData.occupation = credentials.occupation;

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
          gender: user.gender,
          occupation: user.occupation,
          role: user.role,
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
        token.gender = user.gender;
        token.occupation = user.occupation;
        token.role = (user as { role?: string }).role || "USER"; // Default if not immediately available on NextAuth User object
      } else if (token?.email) {
        // Query the database to retrieve latest age and address details
        const dbUser = await db.user.findUnique({
          where: { email: token.email },
          select: { id: true, age: true, address: true, gender: true, occupation: true, role: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.age = dbUser.age;
          token.address = dbUser.address;
          token.gender = dbUser.gender;
          token.occupation = dbUser.occupation;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.age = token.age;
        session.user.address = token.address;
        session.user.gender = token.gender;
        session.user.occupation = token.occupation;
        session.user.role = token.role;
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
