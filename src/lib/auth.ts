import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { LoginSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";

// FR-032: Lockout after 5 consecutive failed attempts for 15 minutes
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Fetch profile for display name
        const profile = await db.userProfile.findUnique({
          where: { userId: user.id as string },
        });
        if (profile) {
          token.name = profile.displayName;
          token.gender = profile.gender;
          token.leetcodeUsername = profile.leetcodeUsername;
        }
        // Fetch role
        const dbUser = await db.user.findUnique({
          where: { id: user.id as string },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        const userObj = session.user as unknown as Record<string, unknown>;
        userObj.role = token.role;
        userObj.gender = token.gender;
        userObj.leetcodeUsername = token.leetcodeUsername;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);
        if (!validatedFields.success) return null;

        const { email, password } = validatedFields.data;

        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        // FR-032: Check lockout
        if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
          throw new Error("Account is temporarily locked. Please try again later.");
        }

        // Check verification & auto-activate if needed
        if (!user.emailVerified) {
          await db.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date(), status: "ACTIVE" },
          });
        }

        // FR-013: Verify password
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatch) {
          // Increment failed attempts
          const failedAttempts = user.failedLoginAttempts + 1;
          const updateData: Record<string, unknown> = {
            failedLoginAttempts: failedAttempts,
          };

          // FR-032: Lock after 5 failed attempts
          if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
            updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
          }

          await db.user.update({
            where: { id: user.id },
            data: updateData,
          });

          return null; // Generic error (FR-013)
        }

        // Successful login: reset failed attempts
        await db.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: 0, lockedUntil: null },
        });

        return { id: user.id, email: user.email };
      },
    }),
    Credentials({
      id: "firebase-social",
      name: "Firebase Social",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
        firebaseUid: { label: "Firebase UID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.firebaseUid) return null;
        const email = (credentials.email as string).toLowerCase().trim();
        const name = (credentials.name as string) || email.split("@")[0];

        let user = await db.user.findUnique({ where: { email } });
        if (!user) {
          const baseHandle = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") || `user_${Date.now()}`;
          let handle = baseHandle;
          const existingProfile = await db.userProfile.findFirst({ where: { leetcodeUsername: handle } });
          if (existingProfile) {
            handle = `${baseHandle}_${Math.random().toString(36).substring(2, 6)}`;
          }

          user = await db.user.create({
            data: {
              email,
              passwordHash: await bcrypt.hash(Math.random().toString(36), 10),
              emailVerified: new Date(),
              status: "ACTIVE",
              profile: {
                create: {
                  displayName: name,
                  gender: "MALE",
                  leetcodeUsername: handle,
                },
              },
            },
          });
        } else if (!user.emailVerified || user.status !== "ACTIVE") {
          user = await db.user.update({
            where: { id: user.id },
            data: {
              emailVerified: new Date(),
              status: "ACTIVE",
            },
          });
        }

        return { id: user.id, email: user.email };
      },
    }),
  ],
});