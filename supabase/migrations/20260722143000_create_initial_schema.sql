-- Initial More Than 100 application schema.
-- Application users are managed exclusively by Supabase Auth (auth.users).

create schema if not exists private;

create type public.app_role as enum ('user', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  nickname text unique,
  bio text,
  avatar_url text,
  website_url text,
  instagram_url text,
  facebook_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories (id) on delete set null,
  description text,
  created_at timestamptz not null default now(),
  constraint categories_name_not_blank check (btrim(name) <> ''),
  constraint categories_slug_not_blank check (btrim(slug) <> ''),
  constraint categories_not_own_parent check (parent_id is distinct from id)
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete restrict,
  title text not null,
  slug text not null unique,
  short_description text,
  content text not null,
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint articles_title_not_blank check (btrim(title) <> ''),
  constraint articles_slug_not_blank check (btrim(slug) <> ''),
  constraint articles_content_not_blank check (btrim(content) <> '')
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comments_content_not_blank check (btrim(content) <> '')
);

create table public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stress_score integer not null check (stress_score >= 0),
  sedentary_score integer not null check (sedentary_score >= 0),
  social_score integer not null check (social_score >= 0),
  summary text,
  created_at timestamptz not null default now()
);

create index categories_parent_id_idx on public.categories (parent_id);
create index articles_author_id_idx on public.articles (author_id);
create index articles_category_id_idx on public.articles (category_id);
create index comments_article_id_idx on public.comments (article_id);
create index comments_author_id_idx on public.comments (author_id);
create index assessment_results_user_id_created_at_idx
  on public.assessment_results (user_id, created_at desc);

create function private.is_admin()
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
      and role = 'admin'::public.app_role
  );
$$;

revoke all on function private.is_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

create function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger articles_set_updated_at
before update on public.articles
for each row execute function private.set_updated_at();

create trigger comments_set_updated_at
before update on public.comments
for each row execute function private.set_updated_at();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.articles enable row level security;
alter table public.comments enable row level security;
alter table public.assessment_results enable row level security;

grant select on public.profiles, public.categories, public.articles, public.comments
  to anon, authenticated;
grant insert, update, delete on public.profiles, public.user_roles,
  public.categories, public.articles, public.comments to authenticated;
grant select on public.user_roles, public.assessment_results to authenticated;
grant insert on public.assessment_results to authenticated;

create policy "Profiles are publicly readable"
on public.profiles for select
to anon, authenticated
using (true);

create policy "Users can create their own profile"
on public.profiles for insert
to authenticated
with check (
  id = (select auth.uid())
  or (select private.is_admin())
);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (
  id = (select auth.uid())
  or (select private.is_admin())
)
with check (
  id = (select auth.uid())
  or (select private.is_admin())
);

create policy "Admins can delete profiles"
on public.profiles for delete
to authenticated
using ((select private.is_admin()));

create policy "Users can read their own role"
on public.user_roles for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_admin())
);

create policy "Admins can create roles"
on public.user_roles for insert
to authenticated
with check ((select private.is_admin()));

create policy "Admins can update roles"
on public.user_roles for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins can delete roles"
on public.user_roles for delete
to authenticated
using ((select private.is_admin()));

create policy "Categories are publicly readable"
on public.categories for select
to anon, authenticated
using (true);

create policy "Admins can create categories"
on public.categories for insert
to authenticated
with check ((select private.is_admin()));

create policy "Admins can update categories"
on public.categories for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins can delete categories"
on public.categories for delete
to authenticated
using ((select private.is_admin()));

create policy "Articles are publicly readable"
on public.articles for select
to anon, authenticated
using (true);

create policy "Users can create their own articles"
on public.articles for insert
to authenticated
with check (author_id = (select auth.uid()));

create policy "Authors and admins can update articles"
on public.articles for update
to authenticated
using (
  author_id = (select auth.uid())
  or (select private.is_admin())
)
with check (
  author_id = (select auth.uid())
  or (select private.is_admin())
);

create policy "Authors and admins can delete articles"
on public.articles for delete
to authenticated
using (
  author_id = (select auth.uid())
  or (select private.is_admin())
);

create policy "Comments are publicly readable"
on public.comments for select
to anon, authenticated
using (true);

create policy "Users can create their own comments"
on public.comments for insert
to authenticated
with check (author_id = (select auth.uid()));

create policy "Authors and admins can update comments"
on public.comments for update
to authenticated
using (
  author_id = (select auth.uid())
  or (select private.is_admin())
)
with check (
  author_id = (select auth.uid())
  or (select private.is_admin())
);

create policy "Authors and admins can delete comments"
on public.comments for delete
to authenticated
using (
  author_id = (select auth.uid())
  or (select private.is_admin())
);

create policy "Users can read their own assessment results"
on public.assessment_results for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Users can create their own assessment results"
on public.assessment_results for insert
to authenticated
with check (user_id = (select auth.uid()));
