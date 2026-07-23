-- Avoid PostgreSQL's built-in current_role identifier when evaluating the
-- target user's existing application role.
create or replace function public.admin_set_user_role(target_user_id uuid, requested_role text)
returns public.app_role
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_current_role public.app_role;
  next_role public.app_role;
  admin_count bigint;
begin
  if requested_role is null or requested_role not in ('reader', 'user', 'admin') then
    raise exception 'Invalid application role.' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(7100100);

  select role
  into target_current_role
  from public.user_roles
  where user_id = target_user_id
  for update;

  if not found then
    raise exception 'The target user role was not found.' using errcode = 'P0002';
  end if;

  next_role := requested_role::public.app_role;
  if target_current_role = 'admin'::public.app_role and next_role <> 'admin'::public.app_role then
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
