"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Copy,
  Award,
  RefreshCw,
  ShieldAlert,
  History,
  Calendar,
  LayoutDashboard,
  ArrowLeft,
  Shield,
  Menu,
  X,
} from "lucide-react";
import type { Role } from "@prisma/client";

interface AdminSidebarProps {
  userRole: Role;
  userEmail: string;
  displayName: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  superAdminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "User Moderation",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Duplicate Accounts",
    href: "/admin/duplicates",
    icon: Copy,
  },
  {
    label: "Achievement Studio",
    href: "/admin/achievements",
    icon: Award,
  },
  {
    label: "Sync Operations",
    href: "/admin/sync",
    icon: RefreshCw,
  },
  {
    label: "Access Governance",
    href: "/admin/governance",
    icon: ShieldAlert,
    superAdminOnly: true,
  },
  {
    label: "Audit Logs",
    href: "/admin/audit",
    icon: History,
    superAdminOnly: true,
  },
  {
    label: "Academic Calendar",
    href: "/admin/calendar",
    icon: Calendar,
  },
];

export function AdminSidebar({
  userRole,
  userEmail,
  displayName,
}: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  return (
    <>
      {/* Mobile Top Bar (Visible only on screens < md) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-zinc-950/90 border-b border-zinc-800 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Shield className="h-4 w-4" />
          </div>
          <span className="font-bold text-xs tracking-tight text-zinc-100">
            Platform Admin
          </span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[9px] font-semibold border ${
              isSuperAdmin
                ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                : "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
            }`}
          >
            {userRole === "SUPER_ADMIN" ? "SUPER" : "ADMIN"}
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Backdrop for mobile drawer */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar (drawer on mobile, persistent on desktop) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-950/95 md:bg-zinc-950/80 backdrop-blur-md min-h-screen transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="flex flex-col gap-1 p-5 border-b border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Shield className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-zinc-100">
                Platform Admin
              </span>
            </div>
            {/* Mobile close button inside drawer */}
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden p-1 rounded-md text-zinc-400 hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                isSuperAdmin
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                  : "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
              }`}
            >
              {userRole}
            </span>
            <span
              className="text-[11px] text-zinc-400 truncate max-w-[130px]"
              title={userEmail}
            >
              {userEmail}
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            if (item.superAdminOnly && !isSuperAdmin) {
              return null;
            }

            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? "text-indigo-400" : "text-zinc-500"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer link to return to student app */}
        <div className="p-3 border-t border-zinc-800/80">
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Exit to Student View</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
