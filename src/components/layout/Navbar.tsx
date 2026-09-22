"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Settings, LogOut, Search } from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const user = session?.user as { role?: string; leetcodeUsername?: string; name?: string } | undefined;

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const openAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const navLinks = [
    { name: "Leaderboard", href: "/" },
    { name: "Gender War", href: "/gender-war" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#0b132b] text-white shadow-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white font-display font-extrabold text-lg shadow-sm">
                CR
              </span>
              <span className="font-display text-lg font-black tracking-tight text-white">
                CodeRank
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1.5">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/" || pathname === "/leaderboard"
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? "bg-white/20 text-white shadow-sm"
                        : "text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Search */}
          <div className="hidden lg:flex items-center">
            <div
              onClick={() => {
                const el = document.querySelector('input[type="text"]') as HTMLInputElement;
                if (el) el.focus();
              }}
              className="flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/15 bg-white/10 text-xs text-slate-300 hover:border-white/30 hover:bg-white/15 transition-all w-64 cursor-pointer backdrop-blur-sm"
            >
              <Search className="h-3.5 w-3.5 text-slate-300" />
              <span className="flex-1 text-left text-slate-300">Search coders...</span>
              <kbd className="px-1.5 py-0.5 rounded-md border border-white/20 bg-white/10 text-[10px] font-mono text-slate-300">
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    pathname === "/dashboard"
                      ? "bg-white/20 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Dashboard
                </Link>

                {user?.leetcodeUsername && (
                  <Link
                    href={`/profile/${user.leetcodeUsername}`}
                    className="hidden sm:flex items-center px-3 py-1 rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-white hover:bg-white/20 transition-all"
                  >
                    @{user.leetcodeUsername}
                  </Link>
                )}

                <Link
                  href="/settings/profile"
                  className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="Profile Settings"
                >
                  <Settings className="h-4 w-4" />
                </Link>

                <ThemeToggle />

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => openAuth("register")}
                  className="rounded-full bg-white text-[#0b132b] hover:bg-slate-100 px-4 py-1.5 text-xs font-bold transition-all shadow-sm btn-press"
                >
                  Join Platform
                </button>
                <ThemeToggle />
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
