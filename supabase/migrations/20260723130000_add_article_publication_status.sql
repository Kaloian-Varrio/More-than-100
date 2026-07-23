-- Simple article visibility control. Existing rows remain published.
alter table public.articles
add column is_published boolean not null default true;

drop policy "Articles are publicly readable" on public.articles;

create policy "Published articles are publicly readable"
on public.articles for select to anon, authenticated
using (
  is_published
  or author_id = (select auth.uid())
  or (select private.is_admin())
);
