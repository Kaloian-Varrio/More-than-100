-- Public URLs remain readable because the bucket is public; object listing is limited
-- to the branding folder used to discover the active versioned logo.
drop policy "Site assets are publicly readable" on storage.objects;

create policy "Brand assets are publicly discoverable"
on storage.objects for select to public
using (
  bucket_id = 'site-assets'
  and (storage.foldername(name))[1] = 'branding'
);
