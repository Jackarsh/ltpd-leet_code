import { assertAdmin } from "@/server/auth/rbac";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Console | CodeRank",
  description: "Administrative console for moderation, sync health, achievements, and access governance.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let adminUser;
  try {
    adminUser = await assertAdmin();
  } catch {
    redirect("/auth/login?callbackUrl=/admin");
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500 selection:text-white">
      {/* Persistent Administrative Sidebar */}
      <AdminSidebar
        userRole={adminUser.role}
        userEmail={adminUser.email}
        displayName={adminUser.displayName}
      />

      {/* Main Content View */}
      <main className="flex-1 overflow-y-auto min-h-screen pt-16 sm:pt-20 md:pt-8 p-4 sm:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
