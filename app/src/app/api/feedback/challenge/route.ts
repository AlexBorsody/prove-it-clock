import { NextResponse } from 'next/server';
import { feedbackEnabled } from '@/lib/feedback/data';
import { clientNetwork, issueToken } from '@/lib/feedback/security';

export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const headers = { 'Cache-Control': 'no-store' };
  if (!feedbackEnabled()) return NextResponse.json({ error: 'Feedback is temporarily unavailable.' }, { status: 503, headers });
  const kind = new URL(request.url).searchParams.get('kind');
  if (kind !== 'request' && kind !== 'vote') return NextResponse.json({ error: 'Invalid request.' }, { status: 400, headers });
  if (request.headers.get('sec-fetch-site') === 'cross-site') return NextResponse.json({ error: 'Open the support page to continue.' }, { status: 403, headers });
  try {
    return NextResponse.json({ token: issueToken(kind, clientNetwork(request)) }, { headers });
  } catch {
    return NextResponse.json({ error: 'Feedback is temporarily unavailable.' }, { status: 503, headers });
  }
}
