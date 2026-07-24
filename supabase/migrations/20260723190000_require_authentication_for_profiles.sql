-- Community profiles are discoverable only to signed-in members.
-- Profile writes remain governed by the existing owner/admin policies.

drop policy if exists "Profiles are publicly readable" on public.profiles;

create policy "Authenticated users can read profiles"
on public.profiles for select
to authenticated
using (true);
