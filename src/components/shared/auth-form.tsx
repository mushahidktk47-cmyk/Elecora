"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  signInWithPassword,
  signUpWithPassword,
  signInWithGoogle,
} from "@/lib/supabase/auth-actions";

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

  function handleGoogleSignIn() {
    startTransition(async () => {
      const result = await signInWithGoogle(next);
      if (result.error || !result.url) {
        setError(result.error ?? "Could not start Google sign-in.");
        return;
      }
      window.location.href = result.url;
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
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={isPending}
        className="w-full"
      >
        Continue with Google
      </Button>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>

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
    </div>
  );
}
