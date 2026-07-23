-- Persistent, independently scoped ordering for Admin management and owner dashboards.

alter table public.articles
  add column display_order integer not null default 2147483647 check (display_order >= 0),
  add column owner_order integer not null default 2147483647 check (owner_order >= 0);

alter table public.stories
  add column display_order integer not null default 2147483647 check (display_order >= 0);

alter table public.profiles
  add column admin_order integer not null default 2147483647 check (admin_order >= 0);

alter table public.comments
  add column admin_order integer not null default 2147483647 check (admin_order >= 0),
  add column owner_order integer not null default 2147483647 check (owner_order >= 0);

with ranked as (
  select id, row_number() over (order by created_at desc, id) - 1 as position
  from public.articles
)
update public.articles as target
set display_order = ranked.position
from ranked
where target.id = ranked.id;

with ranked as (
  select id, row_number() over (partition by author_id order by created_at desc, id) - 1 as position
  from public.articles
)
update public.articles as target
set owner_order = ranked.position
from ranked
where target.id = ranked.id;

with ranked as (
  select id, row_number() over (order by created_at desc, id) - 1 as position
  from public.stories
)
update public.stories as target
set display_order = ranked.position
from ranked
where target.id = ranked.id;

with ranked as (
  select id, row_number() over (order by created_at, id) - 1 as position
  from public.profiles
)
update public.profiles as target
set admin_order = ranked.position
from ranked
where target.id = ranked.id;

with ranked as (
  select id, row_number() over (order by created_at desc, id) - 1 as position
  from public.comments
)
update public.comments as target
set admin_order = ranked.position
from ranked
where target.id = ranked.id;

with ranked as (
  select id, row_number() over (partition by author_id order by created_at desc, id) - 1 as position
  from public.comments
)
update public.comments as target
set owner_order = ranked.position
from ranked
where target.id = ranked.id;

create index articles_display_order_idx on public.articles (display_order, created_at desc);
create index articles_author_owner_order_idx on public.articles (author_id, owner_order, created_at desc);
create index stories_display_order_idx on public.stories (display_order, created_at desc);
create index profiles_admin_order_idx on public.profiles (admin_order, created_at);
create index comments_admin_order_idx on public.comments (admin_order, created_at desc);
create index comments_author_owner_order_idx on public.comments (author_id, owner_order, created_at desc);

-- Ordering metadata is writable only through the scoped function below. Existing
-- content grants remain available at column level for normal CRUD operations.
revoke update on public.articles, public.stories, public.profiles, public.comments from authenticated;
grant update (category_id, title, slug, short_description, content, cover_image_url, is_published)
  on public.articles to authenticated;
grant update (title, slug, person_name, intro, content, image_url, themes, is_published)
  on public.stories to authenticated;
grant update (first_name, last_name, nickname, bio, avatar_url, website_url, instagram_url, facebook_url)
  on public.profiles to authenticated;
grant update (content) on public.comments to authenticated;

create function public.reorder_management_items(order_scope text, ordered_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  caller_role public.app_role;
  requested_count integer;
  matched_count integer;
begin
  if caller_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select role into caller_role
  from public.user_roles
  where user_id = caller_id;

  if caller_role is null or caller_role = 'reader'::public.app_role then
    raise exception 'Reordering is not permitted for this account.' using errcode = '42501';
  end if;

  requested_count := cardinality(ordered_ids);
  if ordered_ids is null or requested_count < 1 or requested_count > 500 then
    raise exception 'Provide between 1 and 500 item identifiers.' using errcode = '22023';
  end if;

  if (select count(distinct item_id) from unnest(ordered_ids) as item_id) <> requested_count then
    raise exception 'Item identifiers must be unique.' using errcode = '22023';
  end if;

  case order_scope
    when 'admin_articles' then
      if caller_role <> 'admin'::public.app_role then
        raise exception 'Administrator access is required.' using errcode = '42501';
      end if;
      select count(*) into matched_count from public.articles where id = any(ordered_ids);
      if matched_count <> requested_count then raise exception 'One or more articles were not found.' using errcode = 'P0002'; end if;
      update public.articles as target
      set display_order = ordered.position - 1
      from unnest(ordered_ids) with ordinality as ordered(id, position)
      where target.id = ordered.id;

    when 'owner_articles' then
      select count(*) into matched_count
      from public.articles
      where id = any(ordered_ids) and author_id = caller_id;
      if matched_count <> requested_count then raise exception 'Articles may only be reordered by their owner.' using errcode = '42501'; end if;
      update public.articles as target
      set owner_order = ordered.position - 1
      from unnest(ordered_ids) with ordinality as ordered(id, position)
      where target.id = ordered.id and target.author_id = caller_id;

    when 'admin_stories' then
      if caller_role <> 'admin'::public.app_role then
        raise exception 'Administrator access is required.' using errcode = '42501';
      end if;
      select count(*) into matched_count from public.stories where id = any(ordered_ids);
      if matched_count <> requested_count then raise exception 'One or more stories were not found.' using errcode = 'P0002'; end if;
      update public.stories as target
      set display_order = ordered.position - 1
      from unnest(ordered_ids) with ordinality as ordered(id, position)
      where target.id = ordered.id;

    when 'admin_users' then
      if caller_role <> 'admin'::public.app_role then
        raise exception 'Administrator access is required.' using errcode = '42501';
      end if;
      select count(*) into matched_count from public.profiles where id = any(ordered_ids);
      if matched_count <> requested_count then raise exception 'One or more profiles were not found.' using errcode = 'P0002'; end if;
      update public.profiles as target
      set admin_order = ordered.position - 1
      from unnest(ordered_ids) with ordinality as ordered(id, position)
      where target.id = ordered.id;

    when 'admin_comments' then
      if caller_role <> 'admin'::public.app_role then
        raise exception 'Administrator access is required.' using errcode = '42501';
      end if;
      select count(*) into matched_count from public.comments where id = any(ordered_ids);
      if matched_count <> requested_count then raise exception 'One or more comments were not found.' using errcode = 'P0002'; end if;
      update public.comments as target
      set admin_order = ordered.position - 1
      from unnest(ordered_ids) with ordinality as ordered(id, position)
      where target.id = ordered.id;

    when 'owner_comments' then
      select count(*) into matched_count
      from public.comments
      where id = any(ordered_ids) and author_id = caller_id;
      if matched_count <> requested_count then raise exception 'Comments may only be reordered by their owner.' using errcode = '42501'; end if;
      update public.comments as target
      set owner_order = ordered.position - 1
      from unnest(ordered_ids) with ordinality as ordered(id, position)
      where target.id = ordered.id and target.author_id = caller_id;

    else
      raise exception 'Unknown ordering scope.' using errcode = '22023';
  end case;
end;
$$;

revoke all on function public.reorder_management_items(text, uuid[]) from public, anon;
grant execute on function public.reorder_management_items(text, uuid[]) to authenticated;
