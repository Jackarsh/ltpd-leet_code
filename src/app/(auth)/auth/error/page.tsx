import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function AuthErrorPage({ searchParams }: Props) {
  const { error } = await searchParams;

  const getErrorMessage = (errCode?: string) => {
    switch (errCode) {
      case "CredentialsSignin":
        return "Invalid email or password. Please try again.";
      case "AccessDenied":
        return "Access denied. Your account may be locked or pending verification.";
      case "Verification":
        return "The verification token has expired or is invalid.";
      case "Configuration":
        return "A server configuration error occurred. Please contact an administrator.";
      default:
        return "An unexpected authentication error occurred. Please try again.";
    }
  };

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
        <AlertTriangle className="h-7 w-7" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Authentication Error
        </h1>
        <p className="text-sm text-zinc-400 max-w-sm mx-auto">
          {getErrorMessage(error)}
        </p>
      </div>

      <div className="pt-2">
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/25"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}