-- Add a read-only application role and force privileged role changes through a
-- service-role-only database function with serialized last-admin protection.
alter type public.app_role add value if not exists 'reader';

create or replace function private.can_contribute()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role::text in ('user', 'admin')
  );
$$;

revoke all on function private.can_contribute() from public;
grant execute on function private.can_contribute() to authenticated;

-- Browser clients, including admins, may read permitted role records but may
-- never mutate roles directly. The admin-users Edge Function uses service_role.
drop policy if exists "Admins can create roles" on public.user_roles;
drop policy if exists "Admins can update roles" on public.user_roles;
drop policy if exists "Admins can delete roles" on public.user_roles;
revoke insert, update, delete on public.user_roles from authenticated;

create or replace function public.admin_set_user_role(target_user_id uuid, requested_role text)
returns public.app_role
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_role public.app_role;
  next_role public.app_role;
  admin_count bigint;
begin
  if requested_role is null or requested_role not in ('reader', 'user', 'admin') then
    raise exception 'Invalid application role.' using errcode = '22023';
  end if;

  -- Serialize role mutations so concurrent requests cannot demote two final
  -- administrators after both observe an earlier count.
  perform pg_advisory_xact_lock(7100100);

  select role
  into current_role
  from public.user_roles
  where user_id = target_user_id
  for update;

  if not found then
    raise exception 'The target user role was not found.' using errcode = 'P0002';
  end if;

  next_role := requested_role::public.app_role;
  if current_role = 'admin'::public.app_role and next_role <> 'admin'::public.app_role then
    select count(*)
    into admin_count
    from public.user_roles
    where role = 'admin'::public.app_role;

    if admin_count <= 1 then
      raise exception 'The last remaining administrator cannot be demoted.' using errcode = '23514';
    end if;
  end if;

  update public.user_roles
  set role = next_role
  where user_id = target_user_id;

  return next_role;
end;
$$;

revoke all on function public.admin_set_user_role(uuid, text) from public, anon, authenticated;
grant execute on function public.admin_set_user_role(uuid, text) to service_role;

drop policy if exists "Users can create their own articles" on public.articles;
create policy "Contributors can create their own articles"
on public.articles for insert to authenticated
with check (
  author_id = (select auth.uid())
  and (select private.can_contribute())
);

drop policy if exists "Authors and admins can update articles" on public.articles;
create policy "Contributors and admins can update articles"
on public.articles for update to authenticated
using (
  (author_id = (select auth.uid()) and (select private.can_contribute()))
  or (select private.is_admin())
)
with check (
  (author_id = (select auth.uid()) and (select private.can_contribute()))
  or (select private.is_admin())
);

drop policy if exists "Authors and admins can delete articles" on public.articles;
create policy "Contributors and admins can delete articles"
on public.articles for delete to authenticated
using (
  (author_id = (select auth.uid()) and (select private.can_contribute()))
  or (select private.is_admin())
);

drop policy if exists "Users can create their own comments" on public.comments;
create policy "Contributors can create their own comments"
on public.comments for insert to authenticated
with check (
  author_id = (select auth.uid())
  and (select private.can_contribute())
);

drop policy if exists "Authors and admins can update comments" on public.comments;
create policy "Contributors and admins can update comments"
on public.comments for update to authenticated
using (
  (author_id = (select auth.uid()) and (select private.can_contribute()))
  or (select private.is_admin())
)
with check (
  (author_id = (select auth.uid()) and (select private.can_contribute()))
  or (select private.is_admin())
);

drop policy if exists "Authors and admins can delete comments" on public.comments;
create policy "Contributors and admins can delete comments"
on public.comments for delete to authenticated
using (
  (author_id = (select auth.uid()) and (select private.can_contribute()))
  or (select private.is_admin())
);

drop policy if exists "Users can upload their own article images" on storage.objects;
create policy "Contributors can upload their own article images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'article-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select private.can_contribute())
);

drop policy if exists "Owners and admins can update article images" on storage.objects;
create policy "Contributors and admins can update article images"
on storage.objects for update to authenticated
using (
  bucket_id = 'article-images'
  and (
    ((storage.foldername(name))[1] = (select auth.uid())::text and (select private.can_contribute()))
    or (select private.is_admin())
  )
)
with check (
  bucket_id = 'article-images'
  and (
    ((storage.foldername(name))[1] = (select auth.uid())::text and (select private.can_contribute()))
    or (select private.is_admin())
  )
);

drop policy if exists "Owners and admins can delete article images" on storage.objects;
create policy "Contributors and admins can delete article images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'article-images'
  and (
    ((storage.foldername(name))[1] = (select auth.uid())::text and (select private.can_contribute()))
    or (select private.is_admin())
  )
);
