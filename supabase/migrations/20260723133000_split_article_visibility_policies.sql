-- Keep anonymous reads independent from the authenticated-only admin helper.
drop policy "Published articles are publicly readable" on public.articles;

create policy "Guests can read published articles"
on public.articles for select to anon
using (is_published);

create policy "Authenticated users can read permitted articles"
on public.articles for select to authenticated
using (
  is_published
  or author_id = (select auth.uid())
  or (select private.is_admin())
);
