import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { loginSchema } from "./validators";
import { applyRateLimitByKey } from "./rate-limit";
import { verifyRecaptchaToken } from "./captcha";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
    updateAge: 60 * 15
  },
  jwt: {
    maxAge: 60 * 60 * 8
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        captchaToken: { label: "Captcha", type: "text" }
      },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) throw new Error("VALIDATION_FAILED");

        const forwarded = request?.headers?.["x-forwarded-for"];
        const realIp = request?.headers?.["x-real-ip"];
        const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded || realIp || "unknown";
        const rate = await applyRateLimitByKey(`login:${ip}:${parsed.data.email.toLowerCase()}`, 10, 60);
        if (!rate.success) throw new Error("TOO_MANY_REQUESTS");

        const captchaOk = await verifyRecaptchaToken(parsed.data.captchaToken);
        if (!captchaOk) throw new Error("CAPTCHA_FAILED");

        const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
        if (!user) throw new Error("INVALID_CREDENTIALS");

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) throw new Error("INVALID_CREDENTIALS");

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
          })
        ]
      : [])
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existing = await prisma.user.findUnique({ where: { email: user.email.toLowerCase() } });
        if (!existing) {
          await prisma.user.create({
            data: {
              email: user.email.toLowerCase(),
              name: user.name || null,
              passwordHash: await bcrypt.hash(crypto.randomUUID(), 12)
            }
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.role = (user as { role: "USER" | "ADMIN" }).role;
      if (!token.sub && token.email) {
        const byEmail = await prisma.user.findUnique({
          where: { email: token.email.toLowerCase() },
          select: { id: true, role: true }
        });
        if (byEmail) {
          token.sub = byEmail.id;
          token.role = byEmail.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || "";
        session.user.role = (token.role as "USER" | "ADMIN") || "USER";
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const target = new URL(url);
        if (target.origin === baseUrl) return url;
      } catch {
        return baseUrl;
      }
      return baseUrl;
    }
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production" && process.env.NEXTAUTH_URL?.startsWith("https://")
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production" && process.env.NEXTAUTH_URL?.startsWith("https://")
      }
    }
  }
};
