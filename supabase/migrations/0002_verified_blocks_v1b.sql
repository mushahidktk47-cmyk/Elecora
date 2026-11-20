-- Verified Blocks v1b: promote a saved calculation into a reusable
-- workspace unit, with an optional parent link for chaining.
--
-- Architecture notes (see verified-blocks-definition.md):
-- - A block stores NO numbers of its own. It references one
--   saved_calculations row, which already holds the frozen
--   input_json / output_json snapshot plus calculator_slug and
--   calculator_version. Display data is always read from that row,
--   so a block can never drift from its source calculation.
-- - parent_block_id records chaining provenance only: "this block's
--   calculation used the parent block's result as an input". The
--   server verifies that claim at creation time (the parent's primary
--   result value must appear among the child's inputs) — a parent
--   link is never just a user assertion. See
--   src/lib/workspace/block-provenance.ts.
-- - Deleting a block removes the promotion only. The underlying
--   saved calculation is untouched (ON DELETE CASCADE the other way:
--   deleting a saved calculation removes its block, since a block
--   without its source calculation is meaningless).
-- - A block that is a parent of another block cannot be deleted
--   while children exist (ON DELETE RESTRICT + a server-side check),
--   so a chain's provenance can never be silently broken.
-- - project_id is NOT added yet (no projects table in v1b scope).
--   Additive later, like v1a planned.

create table public.verified_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  saved_calculation_id uuid not null references public.saved_calculations(id) on delete cascade,
  parent_block_id uuid references public.verified_blocks(id) on delete restrict,
  title text not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One block per saved calculation: a saved calculation is either
-- promoted (exactly one block) or not promoted. A second promotion
-- would be a second copy of the same numbers with a different title,
-- which breaks "one source of truth".
create unique index verified_blocks_saved_calculation_id_key
  on public.verified_blocks (saved_calculation_id);

create index verified_blocks_user_id_created_at_idx
  on public.verified_blocks (user_id, created_at desc);

create index verified_blocks_parent_block_id_idx
  on public.verified_blocks (parent_block_id);

alter table public.verified_blocks enable row level security;

create policy "Users can view their own verified blocks"
  on public.verified_blocks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own verified blocks"
  on public.verified_blocks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own verified blocks"
  on public.verified_blocks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own verified blocks"
  on public.verified_blocks for delete
  using (auth.uid() = user_id);
