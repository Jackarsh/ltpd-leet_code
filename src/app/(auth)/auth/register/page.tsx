import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Create Account | College Coding Platform",
  description: "Register for the College Coding Platform to track your LeetCode progress and compete with peers.",
};

export default function RegisterPage() {
  return (
    <>
      <h2 className="mb-6 text-xl font-semibold text-zinc-100">Create your account</h2>
      <RegisterForm />
    </>
  );
}
