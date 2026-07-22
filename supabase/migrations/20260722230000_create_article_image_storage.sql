-- Public article cover images with owner-scoped writes and admin moderation.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('article-images', 'article-images', true, 1048576, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Article images are publicly readable"
on storage.objects for select to public
using (bucket_id = 'article-images');

create policy "Users can upload their own article images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'article-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Owners and admins can update article images"
on storage.objects for update to authenticated
using (
  bucket_id = 'article-images'
  and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_admin()))
)
with check (
  bucket_id = 'article-images'
  and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_admin()))
);

create policy "Owners and admins can delete article images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'article-images'
  and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_admin()))
);
