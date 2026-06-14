import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user?: User & {
      id?: string;
      role?: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email", placeholder: "admin@naht-re.sa" },
        password: { label: "كلمة المرور", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("يجب إدخال البريد الإلكتروني وكلمة المرور");
        }

        const realUser = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!realUser || !realUser.password) {
          throw new Error("بيانات الدخول غير صحيحة");
        }

        if (!realUser.isActive) {
          throw new Error("هذا الحساب معطل. يرجى مراجعة إدارة النظام.");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, realUser.password);

        if (!isPasswordValid) {
          throw new Error("كلمة المرور غير صحيحة");
        }

        return {
          id: realUser.id,
          email: realUser.email,
          name: realUser.name,
          role: realUser.role,
          isActive: realUser.isActive,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.isActive = (user as any).isActive;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).isActive = token.isActive;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
