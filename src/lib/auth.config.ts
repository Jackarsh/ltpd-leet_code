import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        const userObj = session.user as unknown as Record<string, unknown>;
        userObj.role = token.role;
        userObj.gender = token.gender;
        userObj.leetcodeUsername = token.leetcodeUsername;
        userObj.needsOnboarding = token.needsOnboarding;
      }
      return session;
    },
  },
  providers: [],
};
