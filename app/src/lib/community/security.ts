import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { UUID } from '../feedback/security';

function key() {
  const secret = process.env.COMMUNITY_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || secret.length < 32) throw Error('Community intake is unavailable.');
  // Domain separation from the database credential and any other signed actions.
  return createHmac('sha256', secret).update('bubble-or-build:community:v1').digest();
}
function networkHash(network: string) { return createHmac('sha256', key()).update(`network:${network}`).digest('hex'); }
export function issueContributionToken(network: string, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ nonce: randomUUID(), issued: now, network: networkHash(network) })).toString('base64url');
  return `${payload}.${createHmac('sha256', key()).update(payload).digest('base64url')}`;
}
export function verifyContributionToken(token: unknown, network: string, now = Date.now()) {
  if (typeof token !== 'string' || token.length > 1000) throw Error('Reload the form and try again.');
  const [payload, signature, ...extra] = token.split('.');
  const expected = createHmac('sha256', key()).update(payload).digest();
  const actual = Buffer.from(signature ?? '', 'base64url');
  if (extra.length || actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw Error('Reload the form and try again.');
  const claim = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (!UUID.test(claim.nonce) || claim.network !== networkHash(network) || !Number.isSafeInteger(claim.issued)
    || now < claim.issued || now - claim.issued > 3_600_000) throw Error('Reload the form and try again.');
  return { nonce: claim.nonce as string, network: claim.network as string, elapsed: now - claim.issued };
}

export async function readContributionRequest(request: Request): Promise<Record<string, unknown>> {
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
      if (size > 32000) { await reader.cancel(); throw Error('Your submission is too long.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Invalid request.');
  return input;
}
