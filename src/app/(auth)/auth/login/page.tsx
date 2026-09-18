import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign In | College Coding Platform",
  description: "Sign in to your College Coding Platform account.",
};

export default function LoginPage() {
  return (
    <>
      <h2 className="mb-6 text-xl font-semibold text-zinc-100">Welcome back</h2>
      <Suspense
        fallback={
          <div className="py-8 text-center text-sm text-zinc-400">
            Loading sign in form...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </>
  );
}