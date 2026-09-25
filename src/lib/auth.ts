import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

// Google OAuth is only registered when credentials are configured, so the app
// keeps working (and reports a clear message) if they are missing.
const hasGoogle = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.passwordHash) {
          // Google-only accounts have no password — email/password login is
          // intentionally not available for them (they can add one in Settings).
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      }
    }),
    ...(hasGoogle
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            async profile(profile) {
              return {
                id: profile.sub,
                name: profile.name,
                email: profile.email,
                image: profile.picture,
              };
            },
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/login",
    newUser: "/register",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    /**
     * Runs before a sign-in is accepted.
     *
     * For Google OAuth this is where we either:
     *  1. re-use an already linked Google account (sign in as that user),
     *  2. link Google to an existing Email + Password account with the same
     *     email (preserving ALL of their data — never a duplicate user), or
     *  3. create a brand new User + Profile + UserSettings and link Google to it.
     */
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") {
        return true;
      }

      const rawProfile = profile as { email_verified?: boolean } | undefined;
      if (rawProfile?.email_verified === false || !user.email) {
        return false;
      }
      const email = user.email.toLowerCase();

      try {
        // 1) Already-linked Google account -> sign in as the linked user.
        const existingAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: "google",
              providerAccountId: account.providerAccountId,
            },
          },
        });

        if (existingAccount) {
          const linkedUser = await prisma.user.findUnique({
            where: { id: existingAccount.userId },
          });
          if (!linkedUser) return false;
          user.id = linkedUser.id;
          user.name = linkedUser.name ?? user.name;
          user.image = linkedUser.image ?? user.image;
          return true;
        }

        // 2) Existing Email + Password account with the same email -> link.
        let dbUser = await prisma.user.findUnique({ where: { email } });

        if (!dbUser) {
          // 3) New account -> create User + Profile + UserSettings + notification defaults.
          dbUser = await prisma.user.create({
            data: {
              email,
              name: user.name || email.split("@")[0],
              image: user.image,
              passwordHash: null,
            },
          });

          await prisma.profile.create({ data: { userId: dbUser.id } });
          await prisma.userSettings.create({
            data: { userId: dbUser.id, theme: "system" },
          });
          await prisma.notificationSettings.create({ data: { userId: dbUser.id } });
        } else {
          // Enrich the existing account with Google's profile data when empty.
          const updates: { name?: string; image?: string } = {};
          if (!dbUser.name && user.name) updates.name = user.name;
          if (!dbUser.image && user.image) updates.image = user.image;
          if (Object.keys(updates).length > 0) {
            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: updates,
            });
          }

          // Defensive: guarantee Profile, UserSettings, NotificationSettings always exist.
          const profileExists = await prisma.profile.findUnique({
            where: { userId: dbUser.id },
            select: { id: true },
          });
          if (!profileExists) {
            await prisma.profile.create({ data: { userId: dbUser.id } });
          }

          const settingsExists = await prisma.userSettings.findUnique({
            where: { userId: dbUser.id },
            select: { id: true },
          });
          if (!settingsExists) {
            await prisma.userSettings.create({ data: { userId: dbUser.id, theme: "system" } });
          }

          const notificationSettingsExists = await prisma.notificationSettings.findUnique({
            where: { userId: dbUser.id },
            select: { id: true },
          });
          if (!notificationSettingsExists) {
            await prisma.notificationSettings.create({ data: { userId: dbUser.id } });
          }
        }

        // Link the Google account to this user.
        try {
          await prisma.account.create({
            data: {
              userId: dbUser.id,
              type: account.type || "oauth",
              provider: "google",
              providerAccountId: account.providerAccountId,
            },
          });
        } catch (linkError: any) {
          // Race: another concurrent request linked it first - reuse that link.
          if (linkError?.code === "P2002") {
            const raced = await prisma.account.findUnique({
              where: {
                provider_providerAccountId: {
                  provider: "google",
                  providerAccountId: account.providerAccountId,
                },
              },
            });
            if (!raced) throw linkError;
            user.id = raced.userId;
            return true;
          }
          throw linkError;
        }

        // The rest of the app (dashboard, API routes, middleware) only knows the
        // user's DB id - Google users get the exact same session as email users.
        user.id = dbUser.id;
        user.name = dbUser.name ?? user.name;
        user.image = dbUser.image ?? user.image;
        return true;
      } catch (error) {
        console.error("Google sign-in error:", error);
        return false;
      }
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub as string;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // `user` is only present on sign-in; from then on the DB id lives in the JWT.
      if (user) {
        token.sub = user.id;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    }
  },
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
};

