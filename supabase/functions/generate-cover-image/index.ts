import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from '@supabase/supabase-js';
import { buildCoverImagePrompt, type ImageContentType, validateContext } from './prompt.ts';
import { generateImage, ProviderGenerationError, ProviderNotConfiguredError } from './provider.ts';

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
  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (contentLength > 20_000) return json({ error: 'Request content is too large.' }, 413);

  const authorization = request.headers.get('Authorization');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!authorization?.startsWith('Bearer ')) return json({ error: 'Authentication is required.' }, 401);
  if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Server configuration is unavailable.' }, 500);

  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: userData, error: userError } = await adminClient.auth.getUser(authorization.slice('Bearer '.length));
  const caller = userData.user;
  if (userError || !caller) return json({ error: 'Authentication is invalid or expired.' }, 401);

  const { data: roleRow, error: roleError } = await adminClient.from('user_roles').select('role').eq('user_id', caller.id).maybeSingle();
  if (roleError) return json({ error: 'Authorization could not be verified.' }, 500);
  const role = roleRow?.role;
  if (role === 'reader' || !role) return json({ error: 'Reader accounts cannot generate images.' }, 403);

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'A valid JSON request body is required.' }, 400);
  }
  const contentType = payload.contentType;
  if (contentType !== 'article' && contentType !== 'story') return json({ error: 'Content type must be article or story.' }, 400);
  if (contentType === 'story' && role !== 'admin') return json({ error: 'Only administrators can generate Story images.' }, 403);

  if (contentType === 'article' && payload.articleId !== undefined) {
    if (!isUuid(payload.articleId)) return json({ error: 'A valid article ID is required.' }, 400);
    const { data: article, error } = await adminClient.from('articles').select('author_id').eq('id', payload.articleId).maybeSingle();
    if (error) return json({ error: 'Article ownership could not be verified.' }, 500);
    if (!article) return json({ error: 'The article was not found.' }, 404);
    if (role !== 'admin' && article.author_id !== caller.id) return json({ error: 'You can only generate images for your own Articles.' }, 403);
  }

  try {
    const context = validateContext(contentType as ImageContentType, payload.context);
    const prompt = buildCoverImagePrompt(contentType as ImageContentType, context);
    const image = await generateImage(prompt);
    return json(image);
  } catch (error) {
    if (error instanceof ProviderNotConfiguredError) return json({ error: error.message, code: 'provider_not_configured' }, 503);
    if (error instanceof ProviderGenerationError) return json({ error: error.message }, 502);
    if (error instanceof Error) return json({ error: error.message }, 400);
    return json({ error: 'Image generation could not be completed.' }, 500);
  }
});
