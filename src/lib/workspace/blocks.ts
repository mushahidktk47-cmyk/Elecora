"use server";

import { createClient } from "@/lib/supabase/server";
import { getCalculatorBySlug } from "@/calculations/registry";
import {
  getPrimaryResultValue,
  isSuperseded,
  parentValueUsedInInput,
} from "./block-provenance";

/**
 * Verified Blocks — Server Actions (v1b).
 *
 * Same discipline as Workspace v1a (src/lib/workspace/actions.ts):
 * all writes go through Server Actions, identity is verified with
 * supabase.auth.getClaims(), and Row-Level Security is the backstop,
 * never the only check.
 *
 * The rules enforced here — and nowhere else, so they cannot be
 * bypassed from the UI:
 *
 * - A block can only be created from one of the user's OWN saved
 *   calculations. Numbers are never accepted from the client.
 * - One block per saved calculation (unique index in migration 0002).
 * - A parent link is only accepted when the server proves the chain:
 *   the parent block's PRIMARY result value must appear among the
 *   child calculation's inputs (see block-provenance.ts). A claimed
 *   link with no matching value is rejected.
 * - Update may change ONLY title and note. There is no code path
 *   that changes a block's numbers, calculator, version or parent —
 *   those live on the frozen saved calculation, not on the block.
 * - Delete removes the promotion only. A block that is a parent of
 *   another block cannot be deleted (its children would lose their
 *   provenance); delete the children first.
 */

async function getUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  return claimsData ? (claimsData.claims.sub as string) : null;
}

export interface BlockActionResult {
  success: boolean;
  error?: string;
  blockId?: string;
}

export async function createVerifiedBlock(
  savedCalculationId: string,
  title: string,
  note: string | null,
  parentBlockId: string | null
): Promise<BlockActionResult> {
  const supabase = await createClient();
  const userId = await getUserId();
  if (!userId) {
    return { success: false, error: "You must be signed in to create a Verified Block." };
  }

  const trimmedTitle = title.trim();
  if (trimmedTitle === "") {
    return { success: false, error: "Give the block a title." };
  }

  // The source calculation must exist and belong to this user. RLS
  // already restricts the query, the user_id check is defense in depth.
  const { data: saved, error: savedError } = await supabase
    .from("saved_calculations")
    .select("id, user_id, calculator_slug, input_json, output_json")
    .eq("id", savedCalculationId)
    .single();
  if (savedError || !saved) {
    return { success: false, error: "That saved calculation could not be found." };
  }
  if ((saved.user_id as string) !== userId) {
    return { success: false, error: "That saved calculation could not be found." };
  }

  const { data: existing } = await supabase
    .from("verified_blocks")
    .select("id")
    .eq("saved_calculation_id", savedCalculationId)
    .maybeSingle();
  if (existing) {
    return { success: false, error: "This calculation is already a Verified Block." };
  }

  // Chaining: verify the parent link, don't just record the claim.
  if (parentBlockId) {
    const { data: parent, error: parentError } = await supabase
      .from("verified_blocks")
      .select("id, user_id, saved_calculation_id")
      .eq("id", parentBlockId)
      .single();
    if (parentError || !parent || (parent.user_id as string) !== userId) {
      return { success: false, error: "That parent block could not be found." };
    }
    const { data: parentSaved, error: parentSavedError } = await supabase
      .from("saved_calculations")
      .select("calculator_slug, output_json")
      .eq("id", parent.saved_calculation_id as string)
      .single();
    if (parentSavedError || !parentSaved) {
      return { success: false, error: "That parent block could not be found." };
    }
    const parentSlug = parentSaved.calculator_slug as string;
    const parentPrimary = getPrimaryResultValue(parentSlug, parentSaved.output_json);
    if (
      !parentValueUsedInInput(parentSlug, parentSaved.output_json, saved.input_json)
    ) {
      return {
        success: false,
        error:
          parentPrimary === null
            ? "That block cannot be a parent — its calculator has no single result value to chain from."
            : `The parent block's result (${parentPrimary}) is not used in this calculation, so it cannot be its parent.`,
      };
    }
  }

  const { data, error } = await supabase
    .from("verified_blocks")
    .insert({
      user_id: userId,
      saved_calculation_id: savedCalculationId,
      parent_block_id: parentBlockId,
      title: trimmedTitle,
      note: note === null ? null : note.trim() === "" ? null : note.trim(),
    })
    .select("id")
    .single();
  if (error || !data) {
    return { success: false, error: "Could not create this Verified Block. Please try again." };
  }
  return { success: true, blockId: data.id as string };
}

export interface VerifiedBlockSummary {
  id: string;
  title: string;
  note: string | null;
  parentBlockId: string | null;
  parentTitle: string | null;
  createdAt: string;
  savedCalculationId: string;
  calculatorSlug: string;
  calculatorVersion: number;
  superseded: boolean;
}

export async function listVerifiedBlocks(): Promise<VerifiedBlockSummary[]> {
  const supabase = await createClient();
  const userId = await getUserId();
  if (!userId) return [];

  const { data: blocks, error } = await supabase
    .from("verified_blocks")
    .select("id, title, note, parent_block_id, saved_calculation_id, created_at")
    .order("created_at", { ascending: false });
  if (error || !blocks) return [];

  const savedIds = blocks.map((b) => b.saved_calculation_id as string);
  const { data: savedRows } = await supabase
    .from("saved_calculations")
    .select("id, calculator_slug, calculator_version")
    .in("id", savedIds);
  const savedById = new Map(
    (savedRows ?? []).map((row) => [row.id as string, row])
  );
  const titleById = new Map(blocks.map((b) => [b.id as string, b.title as string]));

  return blocks
    .map((block) => {
      const saved = savedById.get(block.saved_calculation_id as string);
      if (!saved) return null;
      const definition = getCalculatorBySlug(saved.calculator_slug as string);
      return {
        id: block.id as string,
        title: block.title as string,
        note: (block.note as string | null) ?? null,
        parentBlockId: (block.parent_block_id as string | null) ?? null,
        parentTitle: block.parent_block_id
          ? (titleById.get(block.parent_block_id as string) ?? null)
          : null,
        createdAt: block.created_at as string,
        savedCalculationId: block.saved_calculation_id as string,
        calculatorSlug: saved.calculator_slug as string,
        calculatorVersion: saved.calculator_version as number,
        superseded: definition
          ? isSuperseded(
              saved.calculator_version as number,
              definition.calculatorVersion
            )
          : false,
      } satisfies VerifiedBlockSummary;
    })
    .filter((b): b is VerifiedBlockSummary => b !== null);
}

export interface VerifiedBlockDetail extends VerifiedBlockSummary {
  inputJson: unknown;
  outputJson: unknown;
}

export async function getVerifiedBlock(id: string): Promise<VerifiedBlockDetail | null> {
  const supabase = await createClient();
  const userId = await getUserId();
  if (!userId) return null;

  const { data: block, error } = await supabase
    .from("verified_blocks")
    .select("id, title, note, parent_block_id, saved_calculation_id, created_at")
    .eq("id", id)
    .single();
  if (error || !block) return null;

  // Ownership is checked explicitly, not left to RLS alone. RLS
  // already restricts this query to the user's own rows, so a
  // missing row and a foreign row look the same here — both null.
  const { data: saved, error: savedError } = await supabase
    .from("saved_calculations")
    .select("id, user_id, calculator_slug, calculator_version, input_json, output_json")
    .eq("id", block.saved_calculation_id as string)
    .single();
  if (savedError || !saved || (saved.user_id as string) !== userId) return null;

  let parentTitle: string | null = null;
  if (block.parent_block_id) {
    const { data: parent } = await supabase
      .from("verified_blocks")
      .select("title")
      .eq("id", block.parent_block_id as string)
      .single();
    parentTitle = parent ? (parent.title as string) : null;
  }

  const definition = getCalculatorBySlug(saved.calculator_slug as string);
  return {
    id: block.id as string,
    title: block.title as string,
    note: (block.note as string | null) ?? null,
    parentBlockId: (block.parent_block_id as string | null) ?? null,
    parentTitle,
    createdAt: block.created_at as string,
    savedCalculationId: block.saved_calculation_id as string,
    calculatorSlug: saved.calculator_slug as string,
    calculatorVersion: saved.calculator_version as number,
    superseded: definition
      ? isSuperseded(
          saved.calculator_version as number,
          definition.calculatorVersion
        )
      : false,
    inputJson: saved.input_json,
    outputJson: saved.output_json,
  };
}

/**
 * Update a block's title and note ONLY. There is deliberately no
 * parameter for numbers, calculator, version or parent — those are
 * frozen on the saved calculation and cannot be changed through
 * this (or any) action.
 */
export async function updateVerifiedBlock(
  id: string,
  title: string,
  note: string | null
): Promise<BlockActionResult> {
  const supabase = await createClient();
  const userId = await getUserId();
  if (!userId) {
    return { success: false, error: "You must be signed in to edit a Verified Block." };
  }
  const trimmedTitle = title.trim();
  if (trimmedTitle === "") {
    return { success: false, error: "Give the block a title." };
  }

  const { data: block, error: fetchError } = await supabase
    .from("verified_blocks")
    .select("id, user_id")
    .eq("id", id)
    .single();
  if (fetchError || !block || (block.user_id as string) !== userId) {
    return { success: false, error: "That Verified Block could not be found." };
  }

  const { error } = await supabase
    .from("verified_blocks")
    .update({
      title: trimmedTitle,
      note: note === null ? null : note.trim() === "" ? null : note.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) {
    return { success: false, error: "Could not update this Verified Block. Please try again." };
  }
  return { success: true, blockId: id };
}

export async function deleteVerifiedBlock(id: string): Promise<BlockActionResult> {
  const supabase = await createClient();
  const userId = await getUserId();
  if (!userId) {
    return { success: false, error: "You must be signed in to delete a Verified Block." };
  }

  const { data: block, error: fetchError } = await supabase
    .from("verified_blocks")
    .select("id, user_id")
    .eq("id", id)
    .single();
  if (fetchError || !block || (block.user_id as string) !== userId) {
    return { success: false, error: "That Verified Block could not be found." };
  }

  // Provenance guard: a parent block cannot be deleted while any
  // child block links to it. Delete the children first.
  const { data: children } = await supabase
    .from("verified_blocks")
    .select("id")
    .eq("parent_block_id", id)
    .limit(1);
  if (children && children.length > 0) {
    return {
      success: false,
      error:
        "This block is the parent of another block. Delete the chained block first, so its provenance is not broken.",
    };
  }

  const { error } = await supabase.from("verified_blocks").delete().eq("id", id);
  if (error) {
    return { success: false, error: "Could not delete this Verified Block. Please try again." };
  }
  // The saved calculation is deliberately NOT deleted — deleting a
  // block removes the promotion only.
  return { success: true };
}
