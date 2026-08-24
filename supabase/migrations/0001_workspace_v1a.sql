-- Workspace v1a: authentication identity + the first persistence
-- primitive ("save this calculation, see it again later").
--
-- Architecture notes (see the Workspace v1a architecture review for
-- full reasoning):
-- - profiles.id = auth.users.id is the canonical identity anchor every
--   future table (projects, learning_progress, ai_conversations, team
--   memberships) will eventually reference.
-- - saved_calculations stores BOTH input_json and output_json as a
--   frozen snapshot at save time — not recompute-only — so a saved
--   calculation's historical meaning can't silently change if a
--   calculator's formula or validation rules change later.
-- - calculator_version is stamped at save time from the registry's new
--   CalculatorDefinition.calculatorVersion field, giving a lightweight,
--   deliberately non-semver way to know which version of a calculator's
--   behavior produced a given saved result.
-- - project_id is NOT added yet (the projects table doesn't exist) —
--   adding it later is a pure additive ALTER TABLE, no migration pain.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up, so the
-- app never has to handle "user exists but has no profile" as a case.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.saved_calculations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  calculator_slug text not null,
  calculator_version integer not null,
  title text not null,
  input_json jsonb not null,
  output_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index saved_calculations_user_id_created_at_idx
  on public.saved_calculations (user_id, created_at desc);

alter table public.saved_calculations enable row level security;

create policy "Users can view their own saved calculations"
  on public.saved_calculations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own saved calculations"
  on public.saved_calculations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own saved calculations"
  on public.saved_calculations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own saved calculations"
  on public.saved_calculations for delete
  using (auth.uid() = user_id);
