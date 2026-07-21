/**
 * Home page — lives in the (marketing) route group so it's grouped with
 * other public pages, but is still served at the root URL "/".
 *
 * This is a Phase 1 placeholder. Real content (search, popular calculators,
 * Learn recommendations, AI Tutor CTA) is built in later phases once those
 * features exist to pull data from.
 */
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Elecora</h1>
      <p className="max-w-md text-neutral-600">
        AI-powered electrical engineering platform — under construction.
      </p>
    </main>
  );
}
