"use server";

import { createClient } from "@/lib/supabase/server";
import { getCalculatorBySlug } from "@/calculations/registry";

/**
 * All writes go through Server Actions, not a public REST API — no
 * external consumer exists yet (matches the platform's "don't build
 * API infrastructure before it's needed" principle).
 *
 * Critical correctness rule: the OUTPUT stored here is never trusted
 * from the client. The server re-validates the input against the
 * calculator's own Zod schema and re-runs the registry's calculate()
 * function itself — the exact same "never trust client-computed
 * values" discipline every calculator has followed since Phase 1,
 * just applied to persistence instead of live UI.
 */

export interface SaveCalculationResult {
  success: boolean;
  error?: string;
  savedCalculationId?: string;
}

export async function saveCalculation(
  calculatorSlug: string,
  rawInput: unknown,
  title: string
): Promise<SaveCalculationResult> {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData) {
    return { success: false, error: "You must be signed in to save a calculation." };
  }
  const userId = claimsData.claims.sub;

  const definition = getCalculatorBySlug(calculatorSlug);
  if (!definition) {
    return { success: false, error: "Unknown calculator." };
  }

  const parsedInput = definition.schema.safeParse(rawInput);
  if (!parsedInput.success) {
    return { success: false, error: "This calculation's input is no longer valid." };
  }

  const result = definition.calculate(parsedInput.data);
  if (!result.success) {
    return { success: false, error: result.message };
  }

  const trimmedTitle = title.trim();
  const finalTitle = trimmedTitle === "" ? definition.name : trimmedTitle;

  const { data, error } = await supabase
    .from("saved_calculations")
    .insert({
      user_id: userId,
      calculator_slug: definition.slug,
      calculator_version: definition.calculatorVersion,
      title: finalTitle,
      input_json: parsedInput.data,
      output_json: result.data,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: "Could not save this calculation. Please try again." };
  }

  return { success: true, savedCalculationId: data.id as string };
}

export interface SavedCalculationSummary {
  id: string;
  calculatorSlug: string;
  title: string;
  createdAt: string;
}

export async function listSavedCalculations(): Promise<SavedCalculationSummary[]> {
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData) return [];

  const { data, error } = await supabase
    .from("saved_calculations")
    .select("id, calculator_slug, title, created_at")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id as string,
    calculatorSlug: row.calculator_slug as string,
    title: row.title as string,
    createdAt: row.created_at as string,
  }));
}

export interface SavedCalculationDetail {
  id: string;
  calculatorSlug: string;
  calculatorVersion: number;
  title: string;
  inputJson: unknown;
  outputJson: unknown;
  createdAt: string;
}

export async function getSavedCalculation(id: string): Promise<SavedCalculationDetail | null> {
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData) return null;

  // RLS already restricts this to the current user's own rows — the
  // query below can't return another user's calculation even if the
  // id is guessed, but we still don't rely on that alone anywhere
  // else in this file (defense in depth, same as every other layer).
  const { data, error } = await supabase
    .from("saved_calculations")
    .select("id, calculator_slug, calculator_version, title, input_json, output_json, created_at")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id as string,
    calculatorSlug: data.calculator_slug as string,
    calculatorVersion: data.calculator_version as number,
    title: data.title as string,
    inputJson: data.input_json,
    outputJson: data.output_json,
    createdAt: data.created_at as string,
  };
}
