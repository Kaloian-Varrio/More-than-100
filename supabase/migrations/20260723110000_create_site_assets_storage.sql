-- Public brand assets with admin-only writes.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-assets', 'site-assets', true, 1048576, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Site assets are publicly readable"
on storage.objects for select to public
using (bucket_id = 'site-assets');

create policy "Admins can upload brand assets"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'site-assets'
  and (storage.foldername(name))[1] = 'branding'
  and (select private.is_admin())
);

create policy "Admins can update brand assets"
on storage.objects for update to authenticated
using (
  bucket_id = 'site-assets'
  and (storage.foldername(name))[1] = 'branding'
  and (select private.is_admin())
)
with check (
  bucket_id = 'site-assets'
  and (storage.foldername(name))[1] = 'branding'
  and (select private.is_admin())
);

create policy "Admins can delete brand assets"
on storage.objects for delete to authenticated
using (
  bucket_id = 'site-assets'
  and (storage.foldername(name))[1] = 'branding'
  and (select private.is_admin())
);
