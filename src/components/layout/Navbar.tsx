"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Settings, LogOut, Menu, X } from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const user = session?.user as { role?: string; leetcodeUsername?: string; name?: string } | undefined;

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* Sapphire Blue navbar */}
      <nav className="sticky top-0 z-40 border-b border-white/10 shadow-lg"
        style={{ background: "linear-gradient(135deg, #0c2461 0%, #1a3a8f 60%, #1e4db7 100%)" }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <div className="flex items-center gap-3 sm:gap-8">
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 border border-white/25 text-white font-display font-extrabold text-lg shadow-sm backdrop-blur-sm group-hover:bg-white/20 transition-all shrink-0">
                CR
              </span>
              <span className="font-display text-lg font-black tracking-tight text-white drop-shadow-sm">
                CodeRank
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden sm:flex items-center gap-1.5">
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
                        ? "bg-white/20 text-white shadow-sm backdrop-blur-sm border border-white/20"
                        : "text-blue-100 hover:text-white hover:bg-white/15"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Auth/Actions */}
            {isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-2.5">
                <Link
                  href="/dashboard"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    pathname === "/dashboard"
                      ? "bg-white/20 text-white shadow-sm border border-white/20"
                      : "text-blue-100 hover:text-white hover:bg-white/15"
                  }`}
                >
                  Dashboard
                </Link>

                {user?.leetcodeUsername && (
                  <Link
                    href={`/profile/${user.leetcodeUsername}`}
                    className="flex items-center px-3 py-1 rounded-full border border-white/25 bg-white/10 text-xs font-semibold text-white hover:bg-white/20 transition-all"
                  >
                    @{user.leetcodeUsername}
                  </Link>
                )}

                <Link
                  href="/settings/profile"
                  className="p-2 rounded-full text-blue-100 hover:text-white hover:bg-white/15 transition-colors"
                  title="Profile Settings"
                >
                  <Settings className="h-4 w-4" />
                </Link>

                <ThemeToggle />

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="p-2 rounded-full text-blue-100 hover:text-white hover:bg-white/15 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => openAuth("register")}
                  className="rounded-full bg-white text-[#0c2461] hover:bg-blue-50 px-4 py-1.5 text-xs font-bold transition-all shadow-sm btn-press"
                >
                  Join Platform
                </button>
                <ThemeToggle />
              </div>
            )}

            {/* Mobile Actions */}
            <div className="flex sm:hidden items-center gap-1.5">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-blue-100 hover:text-white hover:bg-white/15 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-white/10 bg-[#0c2461]/95 backdrop-blur-md shadow-lg">
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/" || pathname === "/leaderboard"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive ? "bg-white/10 text-white" : "text-blue-100 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              
              <div className="my-2 border-t border-white/10" />

              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-semibold text-blue-100 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/settings/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-semibold text-blue-100 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => { setMobileMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                    className="w-full text-left block px-3 py-2 rounded-lg text-sm font-semibold text-rose-300 hover:bg-white/5 hover:text-rose-200 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setMobileMenuOpen(false); openAuth("register"); }}
                  className="w-full text-left block px-3 py-2 rounded-lg text-sm font-semibold text-blue-100 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Join Platform
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}
