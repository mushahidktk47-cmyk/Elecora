import { Hero } from "@/components/marketing/hero";
import { PopularCalculators } from "@/components/marketing/popular-calculators";
import { LearnPreview } from "@/components/marketing/learn-preview";
import { AiTutorCta } from "@/components/marketing/ai-tutor-cta";

/**
 * Real Elecora homepage (Phase 3). Navbar/Footer come from the
 * (marketing) route group's layout.tsx, not this file.
 *
 * Content notes:
 * - Popular Calculators / Learn Preview use placeholder data
 *   (src/lib/placeholder-data.ts) — no fabricated usage stats.
 * - The search bar is functional UI but not wired to real search logic
 *   yet, since no searchable content exists until Phase 4+.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <PopularCalculators />
      <LearnPreview />
      <AiTutorCta />
    </>
  );
}
