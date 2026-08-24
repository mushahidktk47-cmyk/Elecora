import { notFound } from "next/navigation";
import { getCalculatorBySlug } from "@/calculations/registry";
import { calculatorComponents } from "@/components/calculators/registry";
import { CurrentCalculationProvider } from "@/components/calculators/current-calculation-context";
import { SaveToWorkspaceButton } from "@/components/calculators/save-to-workspace-button";
import { createClient } from "@/lib/supabase/server";

interface CalculatorPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generic calculator page — one file serves every calculator. It looks
 * up metadata from the framework-free registry (src/calculations/registry.ts)
 * and the matching React component from the UI-side registry
 * (src/components/calculators/registry.tsx), keeping those two concerns
 * separate as intended.
 *
 * CurrentCalculationProvider + SaveToWorkspaceButton are the only
 * Workspace v1a additions here — every calculator gets "Save to
 * Workspace" identically, without any calculator-specific save logic.
 */
export default async function CalculatorPage({ params }: CalculatorPageProps) {
  const { slug } = await params;

  const definition = getCalculatorBySlug(slug);
  const Calculator = calculatorComponents[slug];

  if (!definition || !Calculator) {
    notFound();
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">{definition.category}</p>
        <h1 className="text-2xl font-semibold tracking-tight">{definition.name}</h1>
        <p className="text-muted-foreground">{definition.description}</p>
      </div>

      <CurrentCalculationProvider>
        <Calculator />
        <SaveToWorkspaceButton
          calculatorSlug={definition.slug}
          calculatorName={definition.name}
          isAuthenticated={Boolean(claims)}
        />
      </CurrentCalculationProvider>
    </div>
  );
}
