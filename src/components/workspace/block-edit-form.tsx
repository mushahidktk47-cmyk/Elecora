"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateVerifiedBlock } from "@/lib/workspace/blocks";

interface BlockEditFormProps {
  blockId: string;
  initialTitle: string;
  initialNote: string | null;
}

/**
 * Edit a block's title and note ONLY. Numbers, calculator, version
 * and parent are frozen on the saved calculation and have no edit
 * path — this form deliberately has no fields for them.
 */
export function BlockEditForm({ blockId, initialTitle, initialNote }: BlockEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(initialTitle);
  const [note, setNote] = useState(initialNote ?? "");
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  function handleSave() {
    startTransition(async () => {
      const result = await updateVerifiedBlock(blockId, title, note || null);
      if (result.success) {
        setSaved(true);
        setErrorMessage(undefined);
        router.refresh();
      } else {
        setSaved(false);
        setErrorMessage(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-block-title">Title</Label>
        <Input
          id="edit-block-title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setSaved(false);
          }}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-block-note">Note (shown as &quot;not verified&quot;)</Label>
        <Input
          id="edit-block-note"
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setSaved(false);
          }}
          placeholder="Why does this block exist?"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" onClick={handleSave} disabled={isPending || title.trim() === ""}>
          {isPending ? "Saving…" : "Save title and note"}
        </Button>
        {saved ? <p className="text-sm text-muted-foreground">Saved.</p> : null}
      </div>
      {errorMessage ? <p className="text-xs text-destructive">{errorMessage}</p> : null}
    </div>
  );
}
