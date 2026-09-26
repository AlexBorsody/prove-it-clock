import type { PublishedHeartDataset, PublishedRun } from './types';
export interface LedgerSource {
  latest(): Promise<PublishedRun | null>;
  page(runId: string, from: number, to: number): Promise<{ rows: unknown[]; total: number }>;
}
/** Snapshot selection happens exactly once; subsequent pages use its immutable ID. */
export async function readAtlasLedger(source: LedgerSource): Promise<PublishedHeartDataset> {
  const run = await source.latest();
  if (!run) return { run: null, projects: [] };
  if (run.review_status !== 'published') throw new Error('Unpublished Atlas run');
  const projects: unknown[] = []; let total = -1;
  for(let offset=0;;offset+=100) {
    const page=await source.page(run.id,offset,offset+99);
    if(!Number.isSafeInteger(page.total) || page.total<0 || (total>=0 && total!==page.total)) throw new Error('Inconsistent ledger coverage');
    total=page.total;
    if (!page.rows.length && projects.length<total) throw new Error('Incomplete ledger page');
    projects.push(...page.rows);
    if(projects.length>=total) break;
  }
  if(projects.length!==total) throw new Error('Ledger count mismatch');
  return { run, projects };
}
