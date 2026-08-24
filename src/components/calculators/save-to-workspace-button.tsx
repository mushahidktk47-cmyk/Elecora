"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCurrentCalculation } from "./current-calculation-context";
import { saveCalculation } from "@/lib/workspace/actions";

interface SaveToWorkspaceButtonProps {
  calculatorSlug: string;
  calculatorName: string;
  /** Whether the visitor is currently signed in — determined server-side
   *  by the page that renders this, so there's no auth flash/guess on
   *  the client. */
  isAuthenticated: boolean;
}

/**
 * The one place "Save to Workspace" logic lives — every calculator gets
 * this identical button by rendering it once in the dynamic route
 * wrapper; no calculator-specific code needed here or in any of the 10
 * calculator components beyond the one useReportCalculation() call each
 * makes to keep this button aware of their current input.
 *
 * Guest-first: calculators remain fully usable with zero Supabase
 * interaction. This button is the ONLY place auth becomes relevant, and
 * only when clicked while signed out.
 */
export function SaveToWorkspaceButton({
  calculatorSlug,
  calculatorName,
  isAuthenticated,
}: SaveToWorkspaceButtonProps) {
  const router = useRouter();
  const current = useCurrentCalculation();
  const [isPending, startTransition] = useTransition();
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const canSave = current !== null && current.isValid;

  function handleSaveClick() {
    if (!isAuthenticated) {
      // Preserve the current page as `next` so the user lands right
      // back here, with their inputs untouched, after signing in.
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setShowTitleInput(true);
  }

  function handleConfirmSave() {
    if (!current) return;
    startTransition(async () => {
      const result = await saveCalculation(calculatorSlug, current.input, title || calculatorName);
      if (result.success) {
        setStatus("success");
        setShowTitleInput(false);
      } else {
        setStatus("error");
        setErrorMessage(result.error);
      }
    });
  }

  if (status === "success") {
    return (
      <Alert variant="success">
        <AlertDescription>
          Saved to Workspace.{" "}
          <Link href="/saved" className="font-medium underline">
            View My Calculations
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (showTitleInput) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={calculatorName}
          aria-label="Title for this saved calculation"
          className="sm:max-w-xs"
        />
        <div className="flex gap-2">
          <Button type="button" onClick={handleConfirmSave} disabled={isPending}>
            {isPending ? "Saving…" : "Confirm"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setShowTitleInput(false)}>
            Cancel
          </Button>
        </div>
        {status === "error" ? (
          <p className="text-xs text-destructive">{errorMessage}</p>
        ) : null}
      </div>
    );
  }

  return (
    <Button type="button" variant="outline" onClick={handleSaveClick} disabled={!canSave}>
      <Bookmark className="size-4" />
      Save to Workspace
    </Button>
  );
}
