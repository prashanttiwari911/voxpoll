import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "MOCK_GOOGLE_CLIENT_ID",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "MOCK_GOOGLE_CLIENT_SECRET",
    }),
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST || "smtp.ethereal.email",
        port: Number(process.env.SMTP_PORT || 587),
        auth: { user: process.env.SMTP_USER || "test", pass: process.env.SMTP_PASS || "test" },
      },
      from: process.env.EMAIL_FROM || "noreply@voti.com",
      generateVerificationToken: () => Math.floor(100000 + Math.random() * 900000).toString(),
      async sendVerificationRequest({ identifier: email, url, token, provider }) {
        console.log(`\n==========\n[VoTI] 🔑 YOUR LOGIN CODE FOR ${email} IS: ${token}\n[VoTI] Or click this link: ${url}\n==========\n`);
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
          await require("nodemailer").createTransport(provider.server).sendMail({
            to: email, from: provider.from, subject: `Your VoTI Login Code: ${token}`,
            text: `Your login code is ${token}\n\nYou can also click here to login: ${url}`,
            html: `<div style="font-family: sans-serif; max-w: 500px; margin: 0 auto; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-radius: 16px;"><h1 style="color: #4f46e5; margin-bottom: 8px;">VoTI</h1><p style="color: #4b5563; font-size: 16px;">Here is your one-time login code:</p><div style="font-size: 32px; font-weight: 900; letter-spacing: 4px; color: #111827; background: #f3f4f6; padding: 16px; border-radius: 12px; margin: 24px 0;">${token}</div><p style="color: #6b7280; font-size: 14px;">Or you can <a href="${url}" style="color: #4f46e5; text-decoration: none; font-weight: bold;">click here to sign in automatically</a>.</p></div>`,
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
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const email = credentials.email;
        const parsedAge = credentials.age && !isNaN(parseInt(credentials.age, 10)) ? parseInt(credentials.age, 10) : null;
        const requestedRole = typeof credentials.role === "string" ? credentials.role.toUpperCase() : undefined;
        const resolvedRole = requestedRole && ["USER", "ADMIN", "MODERATOR"].includes(requestedRole)
          ? requestedRole
          : email === "admin@voti.com" || email === "system@voti.com"
            ? "ADMIN"
            : "USER";
        let user = await db.user.findUnique({ where: { email } });
        if (!user) {
          user = await db.user.create({
            data: {
              email,
              name: credentials.name || "Demo User",
              age: parsedAge,
              address: credentials.address || "Localhost",
              gender: credentials.gender || null, occupation: credentials.occupation || null, role: resolvedRole,
            },
          });
        } else {
          user = await db.user.update({
            where: { id: user.id },
            data: {
              ...(credentials.age && { age: parsedAge }),
              ...(credentials.address && { address: credentials.address }),
              ...(credentials.name && { name: credentials.name }), ...(credentials.gender && { gender: credentials.gender }),
              ...(credentials.occupation && { occupation: credentials.occupation }),
              ...((requestedRole || email === "admin@voti.com" || email === "system@voti.com") && { role: resolvedRole }),
            },
          });
        }
        return {
          id: user.id, name: user.name, email: user.email, age: user.age, address: user.address, gender: user.gender, occupation: user.occupation, role: user.role,
          image: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${user.name || "user"}&backgroundColor=b6e3f4,c0aade,d1d4f9`,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        Object.assign(token, { id: user.id, age: user.age, address: user.address, gender: user.gender, occupation: user.occupation, role: (user as any).role || "USER" });
      } else if (token?.email) {
        const dbUser = await db.user.findUnique({ where: { email: token.email }, select: { id: true, age: true, address: true, gender: true, occupation: true, role: true } });
        if (dbUser) Object.assign(token, dbUser);
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        Object.assign(session.user, { id: token.id, age: token.age, address: token.address, gender: token.gender, occupation: token.occupation, role: token.role });
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
