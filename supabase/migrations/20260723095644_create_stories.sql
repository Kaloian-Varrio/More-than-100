-- Public inspirational stories managed exclusively by administrators.
create table public.stories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  person_name text not null,
  intro text not null,
  content text not null,
  image_url text,
  themes text[] not null default '{}',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stories_title_not_blank check (btrim(title) <> ''),
  constraint stories_slug_not_blank check (btrim(slug) <> ''),
  constraint stories_person_name_not_blank check (btrim(person_name) <> ''),
  constraint stories_intro_not_blank check (btrim(intro) <> ''),
  constraint stories_content_not_blank check (btrim(content) <> '')
);

create index stories_published_created_at_idx
on public.stories (is_published, created_at desc);

create trigger stories_set_updated_at
before update on public.stories
for each row execute function private.set_updated_at();

alter table public.stories enable row level security;

revoke all on public.stories from anon, authenticated;
grant select on public.stories to anon, authenticated;
grant insert, update, delete on public.stories to authenticated;

create policy "Guests can read published stories"
on public.stories for select to anon
using (is_published);

create policy "Authenticated users can read permitted stories"
on public.stories for select to authenticated
using (is_published or (select private.is_admin()));

create policy "Admins can create stories"
on public.stories for insert to authenticated
with check ((select private.is_admin()));

create policy "Admins can update stories"
on public.stories for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins can delete stories"
on public.stories for delete to authenticated
using ((select private.is_admin()));
