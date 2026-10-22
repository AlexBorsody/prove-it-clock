import { getSupabase } from '../supabase';
import { getPublishedLedger } from '../atlas/data';
import type { ContributionInput, ContributionProject } from './input';

export interface Contribution extends Omit<ContributionInput, 'website'> {
  id: string; status: string; created_at: string; review_note: string | null;
}
export const PUBLIC_COLUMNS = 'id,kind,project_slug,project_name,lineage,claim,detail,source_url,source_date,deadline,status,created_at,review_note';
export function communityConfigured() {
  return process.env.COMMUNITY_ENABLED !== 'false' && !!process.env.SUPABASE_URL
    && (process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0) >= 32;
}
export async function contributionProjects(): Promise<ContributionProject[]> {
  const ledger = await getPublishedLedger();
  return ledger.projects.map(raw => {
    const p = raw as { slug: string; name: string; assessment?: { promises?: { lineage?: string | number; criteria?: string }[] } };
    if (typeof p.slug !== 'string' || typeof p.name !== 'string') throw Error('Invalid project record');
    return {
      slug: p.slug, name: p.name,
      promises: (p.assessment?.promises ?? []).filter(pr => pr.lineage != null && pr.criteria)
        .map(pr => ({ lineage: String(pr.lineage), claim: String(pr.criteria) })),
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}
export async function readCommunity(page = 0) {
  if (!communityConfigured()) return { available: false, entries: [] as Contribution[], more: false };
  try {
    const { data, error } = await getSupabase().from('community_contributions_public').select(PUBLIC_COLUMNS)
      .order('created_at', { ascending: false }).order('id').range(page * 20, page * 20 + 20);
    if (error) throw error;
    return { available: true, entries: (data ?? []).slice(0, 20) as Contribution[], more: (data?.length ?? 0) > 20 };
  } catch { return { available: false, entries: [] as Contribution[], more: false }; }
}
export async function readContributionReceipt(id: string) {
  if (!communityConfigured()) throw Error('Community intake is unavailable.');
  const { data, error } = await getSupabase().from('community_contributions').select(PUBLIC_COLUMNS).eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Contribution | null;
}
