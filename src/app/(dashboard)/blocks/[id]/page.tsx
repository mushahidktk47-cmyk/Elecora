import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVerifiedBlock } from "@/lib/workspace/blocks";
import { getCalculatorBySlug } from "@/calculations/registry";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DataSummary } from "@/components/workspace/data-summary";
import { BlockEditForm } from "@/components/workspace/block-edit-form";
import { DeleteBlockButton } from "@/components/workspace/delete-block-button";

interface VerifiedBlockPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Renders a Verified Block's frozen snapshot exactly as recorded —
 * never recomputed on view, same as a saved calculation. The
 * formula shown is the one stored in the output snapshot
 * (formulaUsed), so the block always shows what actually produced
 * its numbers.
 */
export default async function VerifiedBlockPage({ params }: VerifiedBlockPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) {
    redirect(`/login?next=/blocks/${id}`);
  }

  const block = await getVerifiedBlock(id);
  if (!block) {
    notFound();
  }

  const definition = getCalculatorBySlug(block.calculatorSlug);
  const output = block.outputJson as Record<string, unknown> | null;
  const formulaUsed =
    output && typeof output.formulaUsed === "string" ? output.formulaUsed : null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/blocks" className="text-sm text-muted-foreground hover:text-foreground">
        ← Verified Blocks
      </Link>

      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{definition?.name ?? block.calculatorSlug}</Badge>
          <Badge variant="outline">v{block.calculatorVersion}</Badge>
          {block.superseded ? (
            <Badge variant="destructive">Superseded</Badge>
          ) : (
            <Badge variant="secondary">Verified</Badge>
          )}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{block.title}</h1>
        <p className="text-sm text-muted-foreground">
          Created{" "}
          {new Date(block.createdAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
        {block.superseded ? (
          <p className="text-sm text-destructive">
            This calculator has a newer version now. This block stays frozen
            as it was — run the calculator again to make a new block.
          </p>
        ) : null}
        {formulaUsed ? (
          <p className="font-mono text-sm text-muted-foreground">{formulaUsed}</p>
        ) : null}
      </div>

      {block.parentBlockId ? (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm">
              Chained from:{" "}
              <Link
                href={`/blocks/${block.parentBlockId}`}
                className="font-medium underline"
              >
                {block.parentTitle ?? "Parent block"}
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              The server verified that this calculation used the parent
              block&apos;s result as an input.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Inputs</p>
            <DataSummary data={block.inputJson} />
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Result</p>
            <DataSummary data={block.outputJson} />
          </div>
          {block.note ? (
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                User note — not verified
              </p>
              <p className="text-sm">{block.note}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <p className="font-medium">Title and note</p>
          <p className="text-xs text-muted-foreground">
            Only the title and note can be changed. The numbers, calculator
            and version are frozen.
          </p>
          <BlockEditForm
            blockId={block.id}
            initialTitle={block.title}
            initialNote={block.note}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Link
          href={`/saved/${block.savedCalculationId}`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          View source calculation
        </Link>
        <DeleteBlockButton blockId={block.id} />
      </div>
    </div>
  );
}
