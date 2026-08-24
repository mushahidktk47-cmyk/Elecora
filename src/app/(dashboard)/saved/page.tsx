import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listSavedCalculations } from "@/lib/workspace/actions";
import { getCalculatorBySlug } from "@/calculations/registry";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function SavedCalculationsPage() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();

  if (!claims) {
    redirect("/login?next=/saved");
  }

  const calculations = await listSavedCalculations();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">My Calculations</h1>
        <p className="text-muted-foreground">
          Calculations you&apos;ve saved, with their exact inputs and results
          preserved as they were at the time.
        </p>
      </div>

      {calculations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <p className="font-medium">Nothing saved yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Open any calculator, enter your values, and select &quot;Save
              to Workspace&quot; to keep it here.
            </p>
            <Link href="/calculators" className={cn(buttonVariants({ variant: "outline" }))}>
              Browse calculators
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {calculations.map((calculation) => {
            const definition = getCalculatorBySlug(calculation.calculatorSlug);
            return (
              <Link key={calculation.id} href={`/saved/${calculation.id}`} className="block">
                <Card className="transition-colors hover:border-primary/50">
                  <CardContent className="flex items-center justify-between gap-4 p-4">
                    <div className="flex flex-col gap-0.5">
                      <p className="font-medium">{calculation.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {definition?.name ?? calculation.calculatorSlug}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs text-muted-foreground">
                      {new Date(calculation.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
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
