"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createVerifiedBlock } from "@/lib/workspace/blocks";

export interface ParentCandidate {
  id: string;
  title: string;
  calculatorSlug: string;
}

interface PromoteToBlockFormProps {
  savedCalculationId: string;
  calculatorName: string;
  /** Null when this calculation is not a block yet; the block id when it already is. */
  existingBlockId: string | null;
  parentCandidates: ParentCandidate[];
}

/**
 * Promote a saved calculation to a Verified Block.
 *
 * Chaining is chosen HERE, at promotion time — not inside the
 * calculator forms. That is deliberate: the user already entered
 * the next calculation's inputs by hand (or from a meter), and the
 * server then PROVES the parent link by checking the parent's
 * primary result value actually appears in those inputs. An
 * in-calculator block picker for all 10 calculators would be a
 * much larger change for the same guarantee. See
 * verified-blocks-definition.md §6.
 */
export function PromoteToBlockForm({
  savedCalculationId,
  calculatorName,
  existingBlockId,
  parentCandidates,
}: PromoteToBlockFormProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(calculatorName);
  const [note, setNote] = useState("");
  const [parentBlockId, setParentBlockId] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [createdBlockId, setCreatedBlockId] = useState<string | undefined>();

  if (existingBlockId) {
    return (
      <Alert variant="success">
        <AlertDescription>
          This calculation is already a Verified Block.{" "}
          <Link href={`/blocks/${existingBlockId}`} className="font-medium underline">
            View the block
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "success" && createdBlockId) {
    return (
      <Alert variant="success">
        <AlertDescription>
          Verified Block created.{" "}
          <Link href={`/blocks/${createdBlockId}`} className="font-medium underline">
            View the block
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  function handleCreate() {
    startTransition(async () => {
      const result = await createVerifiedBlock(
        savedCalculationId,
        title,
        note || null,
        parentBlockId === "" ? null : parentBlockId
      );
      if (result.success) {
        setStatus("success");
        setCreatedBlockId(result.blockId);
      } else {
        setStatus("error");
        setErrorMessage(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="block-title">Block title</Label>
        <Input
          id="block-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={calculatorName}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="block-note">Note (optional, shown as &quot;not verified&quot;)</Label>
        <Input
          id="block-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Why does this block exist?"
        />
      </div>
      {parentCandidates.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="block-parent">Chained from (optional)</Label>
          <select
            id="block-parent"
            value={parentBlockId}
            onChange={(e) => setParentBlockId(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none"
          >
            <option value="">No parent — standalone block</option>
            {parentCandidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.title} ({candidate.calculatorSlug})
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Only pick a parent if this calculation used that block&apos;s result
            as an input. The server checks the value matches — a wrong
            parent is rejected.
          </p>
        </div>
      ) : null}
      <div>
        <Button type="button" onClick={handleCreate} disabled={isPending || title.trim() === ""}>
          {isPending ? "Creating…" : "Promote to Verified Block"}
        </Button>
      </div>
      {status === "error" ? (
        <p className="text-xs text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  );
}
