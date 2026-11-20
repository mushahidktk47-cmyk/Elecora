import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSavedCalculation } from "@/lib/workspace/actions";
import { listVerifiedBlocks } from "@/lib/workspace/blocks";
import { PromoteToBlockForm } from "@/components/workspace/promote-to-block-form";
import { getCalculatorBySlug } from "@/calculations/registry";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SavedCalculationPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Renders the frozen input/output snapshot exactly as it was recorded
 * at save time — never recomputed on view. See the Workspace v1a
 * architecture review for why: a saved historical record shouldn't
 * silently change meaning if a calculator's formula is updated later.
 *
 * Output shape varies per calculator (different Result types), so
 * this uses a plain, generic key/value rendering rather than a
 * per-calculator display component — deliberately simple for v1a,
 * consistent with "small implementation, strong foundation."
 */
export default async function SavedCalculationPage({ params }: SavedCalculationPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) {
    redirect(`/login?next=/saved/${id}`);
  }

  const calculation = await getSavedCalculation(id);
  if (!calculation) {
    notFound();
  }

  const definition = getCalculatorBySlug(calculation.calculatorSlug);

  // Verified Blocks (v1b): is this calculation already a block, and
  // which of the user's blocks could be its parent? A block cannot
  // be its own parent, so the existing block for this calculation
  // (if any) is excluded from the candidates.
  const blocks = await listVerifiedBlocks();
  const existingBlock = blocks.find((b) => b.savedCalculationId === calculation.id);
  const parentCandidates = blocks
    .filter((b) => b.id !== existingBlock?.id)
    .map((b) => ({ id: b.id, title: b.title, calculatorSlug: b.calculatorSlug }));

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/saved" className="text-sm text-muted-foreground hover:text-foreground">
        ← My Calculations
      </Link>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{definition?.name ?? calculation.calculatorSlug}</Badge>
          <Badge variant="outline">v{calculation.calculatorVersion}</Badge>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{calculation.title}</h1>
        <p className="text-sm text-muted-foreground">
          Calculated on{" "}
          {new Date(calculation.createdAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Inputs</p>
            <DataSummary data={calculation.inputJson} />
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Result</p>
            <DataSummary data={calculation.outputJson} />
          </div>
        </CardContent>
      </Card>

      {definition ? (
        <Link href={`/calculators/${definition.slug}`} className={cn(buttonVariants({ variant: "outline" }))}>
          Open in calculator
        </Link>
      ) : null}

      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <p className="font-medium">Verified Block</p>
          <p className="text-sm text-muted-foreground">
            Promote this calculation into a reusable block. Its numbers
            stay frozen — only the title and note can be changed later.
          </p>
          <PromoteToBlockForm
            savedCalculationId={calculation.id}
            calculatorName={definition?.name ?? calculation.calculatorSlug}
            existingBlockId={existingBlock?.id ?? null}
            parentCandidates={parentCandidates}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function DataSummary({ data }: { data: unknown }) {
  if (typeof data !== "object" || data === null) {
    return <p className="font-mono text-sm">{String(data)}</p>;
  }

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
      {Object.entries(data as Record<string, unknown>).map(([key, value]) => (
        <div key={key} className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">{key}</dt>
          <dd className="font-mono text-sm tabular-nums">
            {typeof value === "object" ? JSON.stringify(value) : String(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
