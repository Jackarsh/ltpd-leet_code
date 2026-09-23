import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/verify-email",
  "/auth/forgot-password",
  "/auth/new-password",
  "/auth/error",
  "/profiles",
];

const publicPrefixes = [
  "/api/auth",
  "/profiles/",
];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;

  // Allow public routes
  const isPublicRoute = publicRoutes.includes(pathname);
  const isPublicPrefix = publicPrefixes.some((prefix) => pathname.startsWith(prefix));
  const isApiRoute = pathname.startsWith("/api/");

  const needsOnboarding = (req.auth?.user as { needsOnboarding?: boolean })?.needsOnboarding;

  if (isPublicRoute || isPublicPrefix) {
    // Redirect logged-in users away from auth pages
    if (isLoggedIn && pathname.startsWith("/auth/") && pathname !== "/auth/onboarding") {
      if (needsOnboarding) {
        return NextResponse.redirect(new URL("/auth/onboarding", nextUrl));
      }
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // Allow API routes (they handle their own auth)
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL("/auth/login?callbackUrl=" + callbackUrl, nextUrl)
    );
  }

  // Enforce onboarding for incomplete social accounts
  if (needsOnboarding && pathname !== "/auth/onboarding") {
    return NextResponse.redirect(new URL("/auth/onboarding", nextUrl));
  }

  // Prevent accessing onboarding if not needed
  if (!needsOnboarding && pathname === "/auth/onboarding") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
