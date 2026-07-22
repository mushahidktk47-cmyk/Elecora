import { notFound } from "next/navigation";
import { getCalculatorBySlug } from "@/calculations/registry";
import { calculatorComponents } from "@/components/calculators/registry";

interface CalculatorPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generic calculator page — one file serves every calculator. It looks
 * up metadata from the framework-free registry (src/calculations/registry.ts)
 * and the matching React component from the UI-side registry
 * (src/components/calculators/registry.tsx), keeping those two concerns
 * separate as intended.
 */
export default async function CalculatorPage({ params }: CalculatorPageProps) {
  const { slug } = await params;

  const definition = getCalculatorBySlug(slug);
  const Calculator = calculatorComponents[slug];

  if (!definition || !Calculator) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">{definition.category}</p>
        <h1 className="text-2xl font-semibold tracking-tight">{definition.name}</h1>
        <p className="text-muted-foreground">{definition.description}</p>
      </div>

      <Calculator />
    </div>
  );
}
