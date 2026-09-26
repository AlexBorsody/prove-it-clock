import { parseHTML } from 'linkedom';
import { extractSearchSections, type SearchSection } from './site-search';

export const SEARCH_REVALIDATE_SECONDS = 24 * 60 * 60;
export interface SearchIndex {
  sections: SearchSection[];
  generated_at: string;
  total: number;
  failed: string[];
}

/** Only a deployment-owned origin; never trust request Host or a supplied URL. */
export function searchOrigin(env: Record<string,string|undefined> = process.env): string {
  // Generated deployment URLs may be protected even when production is public.
  const vercelHost = env.VERCEL_ENV === 'production'
    ? env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL : env.VERCEL_URL;
  const configured = env.SEARCH_SITE_URL || (vercelHost ? `https://${vercelHost}` : undefined)
    || (env.NODE_ENV === 'development' ? `http://localhost:${env.PORT || '3000'}` : undefined);
  if (!configured) throw new Error('Set SEARCH_SITE_URL to this deployment origin');
  const url = new URL(configured);
  if (!['http:','https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('SEARCH_SITE_URL must be an HTTP origin');
  }
  return url.origin;
}

/** Fixed page allowlist, bounded concurrency/time, no links followed or scripts run. */
export async function crawlSearchPages(origin: string, paths: string[], fetcher: typeof fetch = fetch): Promise<SearchIndex> {
  const queue=[...new Set(paths.filter(path=>/^\/(?!\/)[a-z0-9/-]*$/.test(path)))];
  const total=queue.length;
  const sections: SearchSection[]=[];
  const failed: string[]=[];
  const deadline=AbortSignal.timeout(45_000);
  async function worker() {
    while(queue.length) {
      const path=queue.shift()!;
      try {
        if (deadline.aborted) throw new Error('Index time budget exceeded');
        const response=await fetcher(`${origin}${path}`, {
          headers:{Accept:'text/html'}, redirect:'error', cache:'no-store',
          signal:AbortSignal.any([deadline,AbortSignal.timeout(8_000)]),
        });
        if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) throw new Error('Page unavailable');
        const html=await response.text();
        if (html.length>5_000_000) throw new Error('Page too large');
        const {document}=parseHTML(html);
        const records=extractSearchSections(document as unknown as Document,path);
        if (!records.length) throw new Error('No indexed sections');
        sections.push(...records);
      } catch {failed.push(path);}
    }
  }
  await Promise.all([worker(),worker(),worker()]);
  if (!sections.length) throw new Error('No searchable pages available');
  return {sections:sections.sort((a,b)=>a.id.localeCompare(b.id)),generated_at:new Date().toISOString(),total,failed:failed.sort()};
}
