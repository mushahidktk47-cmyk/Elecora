import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/shared/auth-form";

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center gap-6 px-4 py-12">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign up</h1>
        <p className="text-sm text-muted-foreground">
          Create an account to save and revisit your calculations.
        </p>
      </div>
      <Suspense fallback={null}>
        <AuthForm mode="signup" />
      </Suspense>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
