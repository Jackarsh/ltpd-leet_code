import { Navbar } from "@/components/layout/Navbar";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen flex flex-col bg-[#faf8f5] dark:bg-[#090d16] text-[#1c1917] dark:text-[#f1f5f9] transition-colors duration-200">
        <Navbar />
        <main className="flex-1">{children}</main>
      </div>
    </SessionProvider>
  );
}