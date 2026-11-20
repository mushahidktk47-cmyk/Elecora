"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteVerifiedBlock } from "@/lib/workspace/blocks";

/**
 * Two-click delete. Deleting a block removes the promotion only —
 * the underlying saved calculation is kept. A block that is the
 * parent of another block cannot be deleted; the server refuses it
 * and the error is shown here.
 */
export function DeleteBlockButton({ blockId }: { blockId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteVerifiedBlock(blockId);
      if (result.success) {
        router.push("/blocks");
        router.refresh();
      } else {
        setErrorMessage(result.error);
        setConfirming(false);
      }
    });
  }

  if (confirming) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Deleting…" : "Yes, delete this block"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setConfirming(false)}>
            Cancel
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          The saved calculation is kept — only the block promotion is removed.
        </p>
        {errorMessage ? <p className="text-xs text-destructive">{errorMessage}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Button type="button" variant="outline" onClick={() => setConfirming(true)}>
          Delete block
        </Button>
      </div>
      {errorMessage ? <p className="text-xs text-destructive">{errorMessage}</p> : null}
    </div>
  );
}
