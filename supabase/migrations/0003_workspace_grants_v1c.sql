-- Audit fix v1c: grant the authenticated role access to the workspace tables.
--
-- Migrations 0001 and 0002 created the tables and their RLS policies,
-- but never GRANTed anything to the authenticated role. In Postgres,
-- RLS policies can only *restrict* access a role already has — without
-- a grant, the role has no access at all, so every save failed with
-- 403 / Postgres 42501 "permission denied for table saved_calculations",
-- and Supabase showed the tables as "API DISABLED".
--
-- The same grants were applied manually to the live Supabase project
-- on 20 Nov 2026, so running this migration there is safe and
-- idempotent — GRANT is a no-op when the privilege already exists.
-- This migration exists so a fresh project set up from these files
-- does not break saving in the same way again.
--
-- The grants match what the app actually needs, and nothing more:
-- signed-in users may read, insert, update and delete only their own
-- saved calculations and verified blocks (RLS enforces "own"), and
-- may read and update only their own profile (profiles rows are
-- created by the handle_new_user trigger, never by the app directly).

grant select, insert, update, delete on table public.saved_calculations to authenticated;
grant select, insert, update, delete on table public.verified_blocks to authenticated;
grant select, update on table public.profiles to authenticated;
