/**
 * PLACEHOLDER DATA.
 *
 * As of Phase 0 (post-MVP audit), popular-calculator data now comes
 * directly from the real calculator registry (src/calculations/registry.ts)
 * — see src/components/marketing/popular-calculators.tsx. Only
 * `learnPreview` remains here, since the Learn content system genuinely
 * doesn't exist yet — there is no real data to point to until it's built.
 * Once Learn ships, this file should be removed entirely.
 */

export interface PlaceholderLearnTopic {
  title: string;
  slug: string;
  kind: "Concept" | "Formula" | "Worked Example";
}

export const learnPreview: PlaceholderLearnTopic[] = [
  { title: "Kirchhoff's Voltage Law", slug: "kirchhoffs-voltage-law", kind: "Concept" },
  { title: "Ohm's Law", slug: "ohms-law-formula", kind: "Formula" },
  { title: "Solving a Series Circuit", slug: "series-circuit-example", kind: "Worked Example" },
];
