"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Settings, LogOut, Search } from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const user = session?.user as { role?: string; leetcodeUsername?: string; name?: string } | undefined;
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const openAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const navLinks = [
    { name: "Leaderboard", href: "/" },
    { name: "Gender War", href: "/gender-war" },
    { name: "Card Studio", href: "/studio/card" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-[#1e2632] bg-[#0b0f14]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="font-display text-base font-bold tracking-tight text-[#ece8e1] flex items-center gap-1.5">
                <span>CodeRank</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#c89b68]" />
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = link.href === "/"
                  ? pathname === "/" || pathname === "/leaderboard"
                  : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-[#18212b] text-[#ece8e1] border border-[#25303e]"
                        : "text-[#8d98a5] hover:text-[#ece8e1] hover:bg-[#141b24]"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}

              {isAdmin && (
                <Link
                  href="/admin"
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    pathname.startsWith("/admin")
                      ? "bg-[#21262d] text-[#e6edf3]"
                      : "text-[#848d97] hover:text-[#e6edf3] hover:bg-[#161b22]"
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="hidden lg:flex items-center">
            <div
              onClick={() => {
                const el = document.querySelector('input[type="text"]') as HTMLInputElement;
                if (el) el.focus();
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#25303e] bg-[#0e141b] text-xs text-[#8d98a5] hover:border-[#c89b68]/40 transition-colors w-64 cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="flex-1 text-left">Search coders...</span>
              <kbd className="px-1.5 py-0.5 rounded border border-[#25303e] bg-[#121820] text-[10px] font-mono text-[#6b7785]">
                /
              </kbd>
            </div>
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    pathname === "/dashboard"
                      ? "bg-[#18212b] text-[#ece8e1] border border-[#25303e]"
                      : "text-[#8d98a5] hover:text-[#ece8e1] hover:bg-[#141b24]"
                  }`}
                >
                  Dashboard
                </Link>

                {user?.leetcodeUsername && (
                  <Link
                    href={`/profile/${user.leetcodeUsername}`}
                    className="hidden sm:flex items-center px-2.5 py-1 rounded-lg border border-[#25303e] bg-[#121820] text-xs text-[#ece8e1] hover:border-[#c89b68]/40 transition-colors"
                  >
                    @{user.leetcodeUsername}
                  </Link>
                )}

                <Link
                  href="/settings/profile"
                  className="p-1.5 rounded-lg text-[#8d98a5] hover:text-[#ece8e1] hover:bg-[#141b24] transition-colors"
                  title="Profile Settings"
                >
                  <Settings className="h-4 w-4" />
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="p-1.5 rounded-lg text-[#8d98a5] hover:text-[#ece8e1] hover:bg-[#141b24] transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openAuth("login")}
                  className="px-3 py-1.5 text-xs font-medium text-[#8d98a5] hover:text-[#ece8e1] transition-colors"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => openAuth("register")}
                  className="rounded-lg border border-[#c89b68]/40 bg-[#c89b68]/15 hover:bg-[#c89b68]/25 text-[#f3cf98] px-3.5 py-1.5 text-xs font-semibold transition-all shadow-sm shadow-[#c89b68]/10 btn-press"
                >
                  Join Platform
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}
