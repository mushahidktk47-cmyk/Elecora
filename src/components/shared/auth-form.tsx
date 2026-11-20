"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  signInWithPassword,
  signUpWithPassword,
} from "@/lib/supabase/auth-actions";
// Note: Google sign-in is hidden for now, not deleted. The Google
// provider is disabled in Supabase, so the "Continue with Google"
// button always failed. signInWithGoogle() in auth-actions.ts is
// still there — bring the button back once Google is enabled there.

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [signupComplete, setSignupComplete] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    startTransition(async () => {
      const result =
        mode === "login"
          ? await signInWithPassword(email, password)
          : await signUpWithPassword(email, password);

      if (!result.success) {
        setError(result.error);
        return;
      }

      if (mode === "signup") {
        setSignupComplete(true);
      } else {
        router.push(next);
        router.refresh();
      }
    });
  }

  if (signupComplete) {
    return (
      <Alert>
        <AlertDescription>
          Check your email to confirm your account before signing in.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
        </Button>
      </form>
      {mode === "login" ? (
        <p className="text-center text-sm text-muted-foreground">
          Forgot your password?{" "}
          <Link href="/forgot-password" className="font-medium text-primary hover:underline">
            Reset it
          </Link>
        </p>
      ) : null}
    </div>
  );
}
