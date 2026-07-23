-- Readers may browse published articles but cannot use author ownership to read
-- unpublished content after an administrator assigns the read-only role.
drop policy if exists "Authenticated users can read permitted articles" on public.articles;

create policy "Authenticated users can read permitted articles"
on public.articles for select to authenticated
using (
  is_published
  or (
    author_id = (select auth.uid())
    and (select private.can_contribute())
  )
  or (select private.is_admin())
);
