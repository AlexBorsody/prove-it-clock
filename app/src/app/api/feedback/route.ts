import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { feedbackEnabled } from '@/lib/feedback/data';
import { clientNetwork, parseFeature, sameOrigin, UUID, verifyToken } from '@/lib/feedback/security';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const reply = (error: string, status: number) => NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });

async function readInput(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw Error('Invalid request.');
  const reader = request.body?.getReader();
  if (!reader) throw Error('Invalid request.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 24000) { await reader.cancel(); throw Error('Your request is too long.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Invalid request.');
  return input;
}

export async function POST(request: Request) {
  if (!feedbackEnabled()) return reply('Feedback is temporarily unavailable.', 503);
  if (!sameOrigin(request)) return reply('Open the support page to continue.', 403);
  let input, claim, feature;
  try {
    input = await readInput(request);
    if (input.kind !== 'request' && input.kind !== 'vote') throw Error('Invalid request.');
    claim = verifyToken(input.token, input.kind, clientNetwork(request));
    if (input.kind === 'request') feature = parseFeature(input);
    else if (typeof input.id !== 'string' || !UUID.test(input.id)) throw Error('Please try voting again.');
  } catch (err) {
    return reply(err instanceof SyntaxError ? 'Invalid request.' : err instanceof Error ? err.message : 'Invalid request.', 400);
  }
  try {
    const { data, error } = await getSupabase().rpc('submit_feature_feedback', {
      p_kind: input.kind, p_nonce: claim.nonce, p_ip_hash: claim.ip,
      p_elapsed_ms: claim.elapsed, p_payload: feature ?? { id: input.id },
    });
    if (error || !data) return reply('Could not save that. Please try again.', 503);
    if (data.outcome === 'rate_limited') return reply('Too many requests. Please try again later.', 429);
    if (data.outcome === 'not_found') return reply('This idea is no longer public.', 404);
    if (data.outcome === 'replayed') return reply('This action was already received. Please try again.', 409);
    if (data.outcome === 'rejected') return reply('Please take a moment, then try again.', 400);
    if (!['saved', 'voted', 'already_voted'].includes(data.outcome)) return reply('Could not save that. Please try again.', 503);
    return NextResponse.json({ ok: true, outcome: data.outcome, upvotes: data.upvotes }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return reply('Could not save that. Please try again.', 503); }
}
