import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const authorization = request.headers.get('Authorization');
  if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Server configuration is unavailable.' }, 500);
  if (!authorization?.startsWith('Bearer ')) return json({ error: 'Authentication is required.' }, 401);

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const token = authorization.slice('Bearer '.length);
  const { data: userData, error: userError } = await adminClient.auth.getUser(token);
  const caller = userData.user;
  if (userError || !caller) return json({ error: 'Authentication is invalid or expired.' }, 401);

  const { data: callerRole, error: roleError } = await adminClient
    .from('user_roles')
    .select('role')
    .eq('user_id', caller.id)
    .maybeSingle();
  if (roleError) return json({ error: 'Authorization could not be verified.' }, 500);
  if (callerRole?.role !== 'admin') return json({ error: 'Administrator access is required.' }, 403);

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'A valid JSON request body is required.' }, 400);
  }

  if (payload.action === 'list') {
    const users = [];
    for (let page = 1; page <= 20; page += 1) {
      const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 100 });
      if (error) return json({ error: 'Users could not be loaded.' }, 500);
      users.push(...data.users.map((user) => ({
        id: user.id,
        email: user.email || null,
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at || null,
      })));
      if (data.users.length < 100) break;
    }
    return json({ users });
  }

  const targetUserId = payload.targetUserId;
  if (!isUuid(targetUserId)) return json({ error: 'A valid target user ID is required.' }, 400);

  const { data: targetData, error: targetError } = await adminClient.auth.admin.getUserById(targetUserId);
  if (targetError || !targetData.user) return json({ error: 'The target user was not found.' }, 404);

  const { data: targetRole, error: targetRoleError } = await adminClient
    .from('user_roles')
    .select('role')
    .eq('user_id', targetUserId)
    .maybeSingle();
  if (targetRoleError) return json({ error: 'The target role could not be verified.' }, 500);

  if (payload.action === 'delete') {
    if (targetUserId === caller.id) return json({ error: 'You cannot delete your currently active account.' }, 409);
    if (targetRole?.role === 'admin') {
      const { count, error } = await adminClient
        .from('user_roles')
        .select('user_id', { count: 'exact', head: true })
        .eq('role', 'admin');
      if (error) return json({ error: 'Administrator protection could not be verified.' }, 500);
      if ((count || 0) <= 1) return json({ error: 'The last remaining administrator cannot be deleted.' }, 409);
    }
    const { error } = await adminClient.auth.admin.deleteUser(targetUserId);
    if (error) return json({ error: 'The user account could not be deleted.' }, 500);
    return json({ success: true });
  }

  return json({ error: 'Unknown admin action.' }, 400);
});
