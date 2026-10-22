import { NextResponse } from 'next/server';
import { communityConfigured, contributionProjects } from '@/lib/community/data';
import { parseContribution, resolveContribution } from '@/lib/community/input';
import { readContributionRequest, verifyContributionToken } from '@/lib/community/security';
import { clientNetwork, sameOrigin } from '@/lib/feedback/security';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'no-store' };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers });
export async function POST(request: Request) {
  if (!communityConfigured()) return fail('Community intake is temporarily unavailable.', 503);
  if (!sameOrigin(request)) return fail('Open the contribution page to continue.', 403);
  let input, claim;
  try {
    const body = await readContributionRequest(request);
    claim = verifyContributionToken(body.token, clientNetwork(request));
    input = parseContribution(body);
  } catch (error) { return fail(error instanceof SyntaxError ? 'Invalid request.' : error instanceof Error ? error.message : 'Invalid request.', 400); }
  if (input.website || claim.elapsed < 2000) return fail('Please take a moment, then try again.', 400);
  if (input.project_slug) {
    let projects;
    try { projects = await contributionProjects(); }
    catch { return fail('The promise record could not be checked. Your submission has not been saved. Please try again.', 503); }
    try { input = resolveContribution(input, projects); }
    catch (error) { return fail(error instanceof Error ? error.message : 'Check the selected promise.', 400); }
  }
  try {
    const { data, error } = await getSupabase().rpc('submit_community_contribution', {
      p_nonce: claim.nonce, p_ip_hash: claim.network, p_elapsed_ms: claim.elapsed, p_payload: input,
    });
    if (error || !data) return fail('Could not save your contribution. Please try again.', 503);
    if (data.outcome === 'rate_limited') return fail('Your network has reached its daily submission limit. Please try again tomorrow.', 429);
    if (data.outcome === 'conflict') return fail('This form already sent a different submission. Reload before sending another.', 409);
    if (data.outcome !== 'saved') return fail('Please take a moment, then try again.', 400);
    return NextResponse.json({ ok: true, id: data.id, receipt: `/community/receipt/${data.id}` }, { status: 201, headers });
  } catch { return fail('Could not save your contribution. Please try again.', 503); }
}
