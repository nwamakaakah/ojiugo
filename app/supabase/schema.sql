-- ọjịugo database setup
-- Paste this whole file into Supabase → SQL Editor → New query → Run. Safe to run again.

-- ─────────────────────────────────────────────────────────────
-- Diary pages (quick scribbles and full entries)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.entries (
  id          text primary key,                         -- made on the phone, so pages can be written offline
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind        text not null default 'entry' check (kind in ('entry', 'scribble')),
  seen_at     timestamptz not null,                     -- when the bird was seen
  species     text,
  data        jsonb not null default '{}'::jsonb,       -- the rest of the page: place, notes, feelings, photo…
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz                               -- torn-out pages are kept as a marker so every phone hears about it
);

create index if not exists entries_user_updated on public.entries (user_id, updated_at);

-- keep updated_at honest whatever the phone sends
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at := now(); return new; end $$;

drop trigger if exists entries_touch on public.entries;
create trigger entries_touch before insert or update on public.entries
  for each row execute function public.touch_updated_at();

-- each birder can only ever see and change their own diary
alter table public.entries enable row level security;

drop policy if exists "own entries: read"   on public.entries;
drop policy if exists "own entries: add"    on public.entries;
drop policy if exists "own entries: change" on public.entries;
drop policy if exists "own entries: remove" on public.entries;
create policy "own entries: read"   on public.entries for select to authenticated using (user_id = (select auth.uid()));
create policy "own entries: add"    on public.entries for insert to authenticated with check (user_id = (select auth.uid()));
create policy "own entries: change" on public.entries for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own entries: remove" on public.entries for delete to authenticated using (user_id = (select auth.uid()));

grant select, insert, update, delete on public.entries to authenticated;

-- live updates: phones signed in to the same diary hear about changes straight away
do $$ begin
  alter publication supabase_realtime add table public.entries;
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────
-- Bird photos — a private bucket, one folder per birder
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do nothing;

drop policy if exists "own photos: read"   on storage.objects;
drop policy if exists "own photos: add"    on storage.objects;
drop policy if exists "own photos: change" on storage.objects;
drop policy if exists "own photos: remove" on storage.objects;
create policy "own photos: read"   on storage.objects for select to authenticated using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "own photos: add"    on storage.objects for insert to authenticated with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "own photos: change" on storage.objects for update to authenticated using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "own photos: remove" on storage.objects for delete to authenticated using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ─────────────────────────────────────────────────────────────
-- "delete account" in nestkeeping
-- ─────────────────────────────────────────────────────────────
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  -- (the app removes the birder's photos through the Storage API just before calling this)
  delete from auth.users where id = auth.uid();   -- entries go with it (on delete cascade)
end $$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
