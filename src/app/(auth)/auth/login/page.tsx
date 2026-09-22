import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign In | CodeRank",
  description: "Sign in to your CodeRank account.",
};

export default function LoginPage() {
  return (
    <>
      <h2 className="mb-6 text-xl font-bold font-display text-stone-900 dark:text-white">Welcome back</h2>
      <Suspense
        fallback={
          <div className="py-8 text-center text-sm text-stone-400">
            Loading sign in form...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </>
  );
}