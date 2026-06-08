import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string")
          throw new Error("Email and password are required");

        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) throw new Error("Email is required");

        try {
          const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true, email: true, name: true, passwordHash: true },
          });
          if (!user) throw new Error("Incorrect email or password");
          if (!verifyPassword(password, user.passwordHash))
            throw new Error("Incorrect email or password");

          return { id: user.id, email: user.email, name: user.name ?? undefined };
        } catch (e) {
          if (e instanceof Error) throw e;
          throw new Error("Login failed. Please try again.");
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    // Persist user id into the token on sign-in
    jwt: ({ token, user }): JWT => {
      if (user) token.id = user.id;
      return token;
    },

    // Expose user id (and name) to the session object
    session: ({ session, token }) => {
      if (token.id) session.user.id = token.id as string;
      if (token.name) session.user.name = token.name;
      return session;
    },
  },

  pages: {
    signIn: "/",
  },
};
