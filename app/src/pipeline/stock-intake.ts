/**
 * Stock claim intake. Mirrors app/src/pipeline/promise-intake.ts for the
 * Speculative Tech domain: validates researched company claim-capture
 * documents and writes append-only capture artifacts under
 * db/research/stock-intake/. Draft research records, never ratings.
 *
 * Event kinds: claim_stated, claim_repeated, claim_revised, evidence,
 * fundamentals_reported, assessment. Guidance revisions are new events that
 * reference what they revise; the original event is never edited.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { isStockCompanySlug, STOCK_COMPANIES } from '../lib/stock-companies';

export const STOCK_CLAIM_CATEGORIES = [
  'Financial Guidance',
  'Product/Technology',
  'Adoption/Market Expansion',
  'Operations/Capacity',
  'Strategic Transformation',
  'Capital Allocation',
  'M&A / Portfolio',
  'Moonshots',
] as const;

export const STOCK_CLAIM_TAGS = ['AI', 'autonomy', 'robotics', 'space', 'energy', 'chips', 'semiconductors', 'cloud', 'manufacturing'] as const;

export const STOCK_EVENT_KINDS = [
  'claim_stated',
  'claim_repeated',
  'claim_revised',
  'evidence',
  'fundamentals_reported',
  'assessment',
] as const;

export const STOCK_ASSESSMENT_STATES = ['open', 'active', 'fulfilled', 'missed', 'withdrawn', 'superseded'] as const;

/** Source hierarchy (v1 scope §9). Provenance/confidence only, never promise weight. */
export const STOCK_SOURCE_TYPES = [
  '10-k',
  '10-q',
  '8-k',
  'earnings-call',
  'investor-day',
  'press-release',
  'executive-interview',
  'executive-social',
] as const;

/** Time horizon is first-class metadata (v1 scope §11): commitment type, not weight. */
export const STOCK_HORIZONS = ['quarter', 'annual', 'multi_year', 'undated'] as const;

const ID_RE = /^[a-zA-Z0-9_-]{1,160}$/;
const SLUG_RE = /^[a-z0-9-]{1,60}$/;
const DATE_RE = /^\d{4}(-\d{2}(-\d{2})?)?$/;
const URL_RE = /^https?:\/\/[^/@\s]+([/?#][^\s]*)?$/;

function isText(value: unknown, min = 1, max = 10000): value is string {
  return typeof value === 'string' && value.trim().length >= min && value.length <= max;
}

function isDate(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const expanded = value + (value.length === 4 ? '-01-01' : value.length === 7 ? '-01' : '');
  const parsed = new Date(expanded + 'T00:00:00Z');
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === expanded;
}

function isFuture(value: string): boolean {
  const expanded = value + (value.length === 4 ? '-01-01' : value.length === 7 ? '-01' : '');
  return expanded > new Date().toISOString().slice(0, 10);
}

export interface StockSource {
  url: string;
  title: string;
  publishedOn: string;
  quote?: string;
  locator?: string;
}

function validateSource(source: unknown, where: string): asserts source is StockSource {
  if (!source || typeof source !== 'object') throw new Error(`${where}: source must be an object`);
  const s = source as Record<string, unknown>;
  if (!isText(s.url) || !URL_RE.test(s.url as string)) throw new Error(`${where}: source.url must be an http(s) URL`);
  if (!isText(s.title, 1, 300)) throw new Error(`${where}: source.title required`);
  if (!isDate(s.publishedOn)) throw new Error(`${where}: source.publishedOn must be YYYY[-MM[-DD]]`);
  if (isFuture(s.publishedOn as string)) throw new Error(`${where}: source.publishedOn is in the future`);
  if (s.quote !== undefined && !isText(s.quote, 1, 2000)) throw new Error(`${where}: source.quote must be text`);
  if (s.locator !== undefined && !isText(s.locator, 1, 300)) throw new Error(`${where}: source.locator must be text`);
}

export interface StockEvent {
  id: string;
  lineage: string;
  kind: (typeof STOCK_EVENT_KINDS)[number];
  occurredOn: string;
  summary: string;
  author: string;
  source: StockSource;
  [key: string]: unknown;
}

export interface StockClaimDocument {
  schemaVersion: 1;
  kind: 'stock-claim-capture';
  companySlug: string;
  lineage: string;
  claimCategory: string;
  tags: string[];
  capturedAt: string;
  events: StockEvent[];
}

function validateEvent(event: unknown, index: number, lineage: string): asserts event is StockEvent {
  const where = `event[${index}]`;
  if (!event || typeof event !== 'object') throw new Error(`${where}: must be an object`);
  const e = event as Record<string, unknown>;
  if (!isText(e.id) || !ID_RE.test(e.id as string)) throw new Error(`${where}: id must match [a-zA-Z0-9_-]{1,160}`);
  if (e.lineage !== lineage) throw new Error(`${where}: lineage must match document lineage`);
  if (!STOCK_EVENT_KINDS.includes(e.kind as (typeof STOCK_EVENT_KINDS)[number])) {
    throw new Error(`${where}: unknown event kind ${String(e.kind)}`);
  }
  if (!isDate(e.occurredOn)) throw new Error(`${where}: occurredOn must be YYYY[-MM[-DD]]`);
  if (isFuture(e.occurredOn as string)) throw new Error(`${where}: occurredOn is in the future`);
  // occurred_at vs recorded_at stay separate (v1 scope §5): a historical event
  // researched today must not appear as something known at the time.
  if (!isDate(e.recordedAt)) throw new Error(`${where}: recordedAt must be YYYY[-MM[-DD]]`);
  if (isFuture(e.recordedAt as string)) throw new Error(`${where}: recordedAt is in the future`);
  if (!isText(e.summary, 1, 2000)) throw new Error(`${where}: summary required`);
  if (!isText(e.author, 1, 200)) throw new Error(`${where}: author (recorder) required`);
  validateSource(e.source, where);
  if (e.sourceType !== undefined && !(STOCK_SOURCE_TYPES as readonly string[]).includes(e.sourceType as string)) {
    throw new Error(`${where}: sourceType must be one of: ${STOCK_SOURCE_TYPES.join(', ')}`);
  }
  const kind = e.kind as string;
  if (kind === 'claim_stated') {
    if (!isText(e.speaker, 1, 200)) throw new Error(`${where}: claim_stated needs a speaker`);
    if (!isText(e.speakerCapacity, 1, 200)) throw new Error(`${where}: claim_stated needs speakerCapacity`);
  }
  if (kind === 'claim_repeated') {
    if (!isText(e.originalId) || !ID_RE.test(e.originalId as string)) throw new Error(`${where}: claim_repeated needs originalId`);
    if (!['same', 'narrowed', 'expanded'].includes(e.wordingChange as string)) {
      throw new Error(`${where}: claim_repeated needs wordingChange same|narrowed|expanded`);
    }
  }
  if (kind === 'claim_revised') {
    if (!isText(e.supersedes) || !ID_RE.test(e.supersedes as string)) throw new Error(`${where}: claim_revised needs supersedes event id`);
    if (!isText(e.revisionReason, 1, 2000)) throw new Error(`${where}: claim_revised needs revisionReason`);
  }
  if (kind === 'evidence') {
    if (!['supports', 'refutes', 'context'].includes(e.stance as string)) {
      throw new Error(`${where}: evidence needs stance supports|refutes|context`);
    }
    if (!Array.isArray(e.provenance) || e.provenance.length === 0 || !e.provenance.every((p) => isText(p, 1, 300))) {
      throw new Error(`${where}: evidence needs non-empty provenance`);
    }
  }
  if (kind === 'fundamentals_reported') {
    if (!isDate(e.periodEnd)) throw new Error(`${where}: fundamentals_reported needs periodEnd`);
    const metrics = e.metrics as Record<string, unknown> | undefined;
    if (!metrics || typeof metrics !== 'object') throw new Error(`${where}: fundamentals_reported needs metrics`);
  }
  if (kind === 'assessment') {
    if (!STOCK_ASSESSMENT_STATES.includes(e.state as (typeof STOCK_ASSESSMENT_STATES)[number])) {
      throw new Error(`${where}: assessment state must be open|active|fulfilled|missed|withdrawn|superseded`);
    }
    if (!isText(e.methodology, 1, 200)) throw new Error(`${where}: assessment needs methodology`);
    if (e.supersedes !== undefined && e.supersedes !== null && (!isText(e.supersedes) || !ID_RE.test(e.supersedes as string))) {
      throw new Error(`${where}: assessment supersedes must be an event id or null`);
    }
  }
}

export function validateStockClaimDocument(document: unknown): StockClaimDocument {
  if (!document || typeof document !== 'object') throw new Error('Claim document must be an object');
  const d = document as Record<string, unknown>;
  if (d.schemaVersion !== 1 || d.kind !== 'stock-claim-capture') throw new Error('Unknown stock claim document schema');
  if (!isText(d.companySlug) || !SLUG_RE.test(d.companySlug as string) || !isStockCompanySlug(d.companySlug as string)) {
    throw new Error(`Unknown companySlug: ${String(d.companySlug)}`);
  }
  if (!isText(d.lineage) || !ID_RE.test(d.lineage as string)) throw new Error('lineage required');
  if (!(STOCK_CLAIM_CATEGORIES as readonly string[]).includes(d.claimCategory as string)) {
    throw new Error(`claimCategory must be one of: ${STOCK_CLAIM_CATEGORIES.join(', ')}`);
  }
  if (!Array.isArray(d.tags) || !d.tags.every((t) => (STOCK_CLAIM_TAGS as readonly string[]).includes(t as string))) {
    throw new Error(`tags must be a subset of: ${STOCK_CLAIM_TAGS.join(', ')}`);
  }
  if (d.horizon !== undefined && !(STOCK_HORIZONS as readonly string[]).includes(d.horizon as string)) {
    throw new Error(`horizon must be one of: ${STOCK_HORIZONS.join(', ')}`);
  }
  if (!Array.isArray(d.events) || d.events.length === 0 || d.events.length > 500) {
    throw new Error('events must be a non-empty array (max 500)');
  }
  const seen = new Set<string>();
  let statedId: string | null = null;
  let statedCount = 0;
  const typedEvents = d.events as StockEvent[];
  typedEvents.forEach((event, index) => {
    validateEvent(event, index, d.lineage as string);
    const e = event as StockEvent;
    if (seen.has(e.id)) throw new Error(`Duplicate event id: ${e.id}`);
    seen.add(e.id);
    if (e.kind === 'claim_stated') { statedCount += 1; statedId = e.id; }
  });
  if (statedCount !== 1 || statedId === null) throw new Error('Each lineage needs exactly one claim_stated event');
  // Append-only referential integrity: repeats and revisions must point at
  // events already in the lineage, never at something edited or invented.
  for (const e of typedEvents) {
    if (e.kind === 'claim_repeated' && e.originalId !== statedId) {
      throw new Error(`claim_repeated ${e.id} must reference the lineage claim_stated (${statedId})`);
    }
    if (e.kind === 'claim_revised' && !seen.has(e.supersedes as string)) {
      throw new Error(`claim_revised ${e.id} supersedes unknown event ${String(e.supersedes)}`);
    }
  }
  return d as unknown as StockClaimDocument;
}

export interface StockIntakeSnapshot {
  schemaVersion: 1;
  kind: 'stock-intake';
  capturedAt: string;
  payloadSha256: string;
  /** Stock intake is research capture only. Nothing here publishes to the ledger. */
  publication: 'none';
  companies: { slug: string; name: string; listing: string }[];
  validatedLineages: { companySlug: string; lineage: string; events: number; categories: string }[];
}

export async function collectStockIntake(options: {
  directory: string;
  documents: unknown[];
  now?: Date;
}): Promise<{ path: string; snapshot: StockIntakeSnapshot }> {
  const lineages = options.documents.map(validateStockClaimDocument);
  const payload = JSON.stringify(lineages);
  const snapshot: StockIntakeSnapshot = {
    schemaVersion: 1,
    kind: 'stock-intake',
    capturedAt: (options.now ?? new Date()).toISOString(),
    payloadSha256: createHash('sha256').update(payload).digest('hex'),
    publication: 'none',
    companies: STOCK_COMPANIES.map((c) => ({ slug: c.slug, name: c.name, listing: c.listing })),
    validatedLineages: lineages.map((l) => ({
      companySlug: l.companySlug,
      lineage: l.lineage,
      events: l.events.length,
      categories: l.claimCategory,
    })),
  };
  const stamp = snapshot.capturedAt.replace(/[:.]/g, '').replace('T', 'T').slice(0, 15) + 'Z';
  await mkdir(options.directory, { recursive: true });
  const path = join(options.directory, `stock-intake-${stamp}.json`);
  await writeFile(path, JSON.stringify(snapshot, null, 2) + '\n');
  return { path, snapshot };
}

export async function loadJsonFile(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, 'utf8'));
}
