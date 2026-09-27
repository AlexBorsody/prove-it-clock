import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { MARKET_IDS } from '../lib/market-ids';

export const INTAKE_SIZE = 100;
export const INTAKE_SOURCE = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&price_change_percentage=24h,30d&precision=full';
const DAY_MS = 24 * 60 * 60 * 1000;

export interface IntakeCandidate {
  id: string;
  coingeckoId: string;
  name: string;
  symbol: string;
  marketCapRank: number;
  existingProjectSlug: string | null;
  stage: 'existing_mapping' | 'needs_identity_review';
}

export function intakeCandidates(payload: unknown): IntakeCandidate[] {
  if (!Array.isArray(payload) || !payload.length || payload.length > INTAKE_SIZE) {
    throw new Error('Expected 1 to 100 market rows; an empty/error response is not an empty research queue.');
  }
  const known = new Map(Object.entries(MARKET_IDS).map(([slug, id]) => [id, slug]));
  const seen = new Set<string>();
  return payload.map((row): IntakeCandidate => {
    if (!row || typeof row !== 'object'
      || typeof row.id !== 'string' || !/^[a-z0-9][a-z0-9_-]*$/.test(row.id)
      || typeof row.name !== 'string' || !row.name.trim()
      || typeof row.symbol !== 'string' || !row.symbol.trim()
      || !Number.isSafeInteger(row.market_cap_rank) || row.market_cap_rank < 1) {
      throw new Error('Invalid market identity or rank; no intake artifact written.');
    }
    if (seen.has(row.id)) throw new Error(`Duplicate market ID: ${row.id}`);
    seen.add(row.id);
    const slug = known.get(row.id) ?? null;
    return {
      id: `coingecko:${row.id}`, coingeckoId: row.id,
      name: row.name.trim(), symbol: row.symbol.trim().toUpperCase(),
      marketCapRank: row.market_cap_rank, existingProjectSlug: slug,
      stage: slug ? 'existing_mapping' : 'needs_identity_review',
    };
  }).sort((a, b) => a.marketCapRank - b.marketCapRank || a.coingeckoId.localeCompare(b.coingeckoId));
}

export interface IntakeSnapshot {
  schemaVersion: 1;
  kind: 'research-intake';
  capturedAt: string;
  source: string;
  payloadSha256: string;
  requestedCount: 100;
  coverage: 'complete' | 'partial';
  candidates: IntakeCandidate[];
  raw: unknown;
}

function digest(payload: unknown) {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

/** Draft discovery only. No publication client, score defaults or generated promises. */
export async function collectPromiseIntake(options: {
  directory: string;
  fetchMarkets: () => Promise<unknown>;
  now?: Date;
}): Promise<{ path: string; reused: boolean; snapshot: IntakeSnapshot }> {
  const now = options.now ?? new Date();
  await mkdir(options.directory, { recursive: true });
  const files = (await readdir(options.directory))
    .filter(file => /^intake-\d{4}-\d{2}-\d{2}T\d{6}Z\.json$/.test(file)).sort().reverse();
  if (files[0]) {
    const path = join(options.directory, files[0]);
    const saved = JSON.parse(await readFile(path, 'utf8')) as IntakeSnapshot;
    const age = now.getTime() - Date.parse(saved.capturedAt);
    const valid = saved.schemaVersion === 1 && saved.kind === 'research-intake'
      && saved.source === INTAKE_SOURCE && saved.requestedCount === INTAKE_SIZE
      && Number.isFinite(age) && age >= 0 && saved.payloadSha256 === digest(saved.raw);
    if (!valid) throw new Error('Invalid intake cache; inspect it before collecting again.');
    const candidates = intakeCandidates(saved.raw);
    if (JSON.stringify(candidates) !== JSON.stringify(saved.candidates)
      || saved.coverage !== (candidates.length === INTAKE_SIZE ? 'complete' : 'partial')) {
      throw new Error('Intake cache does not match its source rows.');
    }
    if (age < DAY_MS) return { path, reused: true, snapshot: saved };
  }

  const raw = await options.fetchMarkets();
  const candidates = intakeCandidates(raw);
  const capturedAt = now.toISOString();
  const snapshot: IntakeSnapshot = {
    schemaVersion: 1, kind: 'research-intake', capturedAt, source: INTAKE_SOURCE,
    payloadSha256: digest(raw), requestedCount: INTAKE_SIZE,
    coverage: candidates.length === INTAKE_SIZE ? 'complete' : 'partial', candidates, raw,
  };
  const filename = `intake-${capturedAt.slice(0, 19).replaceAll(':', '')}Z.json`;
  const path = join(options.directory, filename);
  await writeFile(path, JSON.stringify(snapshot, null, 2) + '\n', { flag: 'wx' });
  return { path, reused: false, snapshot };
}
