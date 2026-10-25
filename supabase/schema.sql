-- ════════════════════════════════════════
--  LinguaPop — base de données Supabase (projet ygebxzosjxzagumhkkek)
--  Un compte = un adulte (parent ou professeur). Les enfants sont des profils
--  dans ce compte, sans e-mail ni identifiant à eux.
-- ════════════════════════════════════════

-- Une ligne par compte : tous les profils d'enfants, leur progression et les réglages, en JSON
create table if not exists public.linguapop_data (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Chaque adulte ne peut lire et modifier QUE ses propres données
alter table public.linguapop_data enable row level security;

drop policy if exists "lire ses données" on public.linguapop_data;
create policy "lire ses données" on public.linguapop_data
  for select using (auth.uid() = user_id);

drop policy if exists "créer ses données" on public.linguapop_data;
create policy "créer ses données" on public.linguapop_data
  for insert with check (auth.uid() = user_id);

drop policy if exists "modifier ses données" on public.linguapop_data;
create policy "modifier ses données" on public.linguapop_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- RGPD : chacun peut supprimer son compte (et donc toutes les données de ses enfants / élèves)
create or replace function public.delete_my_account()
returns void
language sql
security definer
set search_path = public, auth
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
