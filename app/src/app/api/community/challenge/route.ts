import { NextResponse } from 'next/server';
import { communityConfigured } from '@/lib/community/data';
import { clientNetwork } from '@/lib/feedback/security';
import { issueContributionToken } from '@/lib/community/security';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  const headers = { 'Cache-Control': 'no-store' };
  if (!communityConfigured()) return NextResponse.json({ error: 'Community intake is temporarily unavailable.' }, { status: 503, headers });
  if (request.headers.get('sec-fetch-site') === 'cross-site') return NextResponse.json({ error: 'Open the contribution page to continue.' }, { status: 403, headers });
  try { return NextResponse.json({ token: issueContributionToken(clientNetwork(request)) }, { headers }); }
  catch { return NextResponse.json({ error: 'Community intake is temporarily unavailable.' }, { status: 503, headers }); }
}
