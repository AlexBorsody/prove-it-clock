export const CONTRIBUTION_KINDS = ['promise', 'evidence', 'challenge'] as const;
export type ContributionKind = typeof CONTRIBUTION_KINDS[number];
export const STATUS_LABELS: Record<string, string> = {
  pending: 'Awaiting review', accepted: 'Source reviewed', needs_info: 'More evidence needed', rejected: 'Not accepted',
};
export interface ContributionInput {
  kind: ContributionKind;
  project_slug: string;
  project_name: string;
  lineage: string;
  claim: string;
  detail: string;
  source_url: string;
  source_date: string;
  deadline: string;
  website: string;
}
export interface ContributionProject {
  slug: string; name: string;
  promises: { lineage: string; claim: string }[];
}

export function parseContribution(input: Record<string, unknown>): ContributionInput {
  const field = (key: string, min: number, max: number) => {
    const value = input[key];
    if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max)
      throw Error(`Check the ${key.replaceAll('_', ' ')} field.`);
    return value.trim();
  };
  const kind = field('kind', 1, 20) as ContributionKind;
  if (!CONTRIBUTION_KINDS.includes(kind)) throw Error('Choose a contribution type.');
  const source = field('source_url', 8, 2000);
  let url: URL;
  try { url = new URL(source); } catch { throw Error('Add a public source link.'); }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || !url.hostname.includes('.')
    || /^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname)
    || url.hostname.endsWith('.local') || url.hostname.startsWith('[')) throw Error('Add a public http or https source link.');
  const source_date = field('source_date', 0, 10);
  if (source_date && (!/^\d{4}-\d{2}-\d{2}$/.test(source_date) || !Number.isFinite(Date.parse(source_date))
    || new Date(source_date).toISOString().slice(0, 10) !== source_date)) throw Error('Check the source date.');
  const result: ContributionInput = {
    kind, project_slug: field('project_slug', 0, 100), project_name: field('project_name', 2, 120),
    lineage: field('lineage', 0, 200), claim: field('claim', kind === 'promise' ? 10 : 0, 2000),
    detail: field('detail', 20, 4000), source_url: url.href, source_date,
    deadline: field('deadline', 0, 200), website: field('website', 0, 200),
  };
  if (kind !== 'promise' && (!result.project_slug || !result.lineage)) throw Error('Choose the existing project and promise.');
  return result;
}

/** Resolve identity on the server; never accept a client-supplied claim for an existing promise. */
export function resolveContribution(input: ContributionInput, projects: ContributionProject[]): ContributionInput {
  if (!input.project_slug) return input;
  const project = projects.find(p => p.slug === input.project_slug);
  if (!project) throw Error('This project is unavailable. Reload and try again.');
  if (input.kind === 'promise') return { ...input, project_name: project.name, lineage: '' };
  const promise = project.promises.find(p => p.lineage === input.lineage);
  if (!promise) throw Error('This promise is unavailable. Reload and try again.');
  return { ...input, project_name: project.name, claim: promise.claim, deadline: '' };
}
