import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listVerifiedBlocks } from "@/lib/workspace/blocks";
import { getCalculatorBySlug } from "@/calculations/registry";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function VerifiedBlocksPage() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();

  if (!claims) {
    redirect("/login?next=/blocks");
  }

  const blocks = await listVerifiedBlocks();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Verified Blocks</h1>
        <p className="text-muted-foreground">
          Saved calculations promoted into reusable units. Every number
          comes from a verified calculator — frozen with its inputs,
          formula and calculator version.
        </p>
      </div>

      {blocks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <p className="font-medium">No Verified Blocks yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Open a saved calculation and select &quot;Promote to Verified
              Block&quot; to keep it here as a reusable unit.
            </p>
            <Link href="/saved" className={cn(buttonVariants({ variant: "outline" }))}>
              My Calculations
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {blocks.map((block) => {
            const definition = getCalculatorBySlug(block.calculatorSlug);
            return (
              <Link key={block.id} href={`/blocks/${block.id}`} className="block">
                <Card className="transition-colors hover:border-primary/50">
                  <CardContent className="flex flex-col gap-2 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-medium">{block.title}</p>
                      <p className="shrink-0 text-xs text-muted-foreground">
                        {new Date(block.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">
                        {definition?.name ?? block.calculatorSlug}
                      </Badge>
                      <Badge variant="outline">v{block.calculatorVersion}</Badge>
                      {block.superseded ? (
                        <Badge variant="destructive">Superseded</Badge>
                      ) : (
                        <Badge variant="secondary">Verified</Badge>
                      )}
                      {block.parentTitle ? (
                        <span className="text-xs text-muted-foreground">
                          Chained from: {block.parentTitle}
                        </span>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
