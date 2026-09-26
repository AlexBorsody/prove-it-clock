import Fuse from 'fuse.js';

export interface SearchSection {
  id: string;
  href: string;
  title: string;
  kind: string;
  project?: string;
  text: string;
  keywords: string;
}
export interface SearchProgress {
  sections: SearchSection[];
  completed: number;
  total: number;
  failed: number;
}
const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();

/** Index text inside tagged HTML containers, not a second hand-written content list. */
export function extractSearchSections(doc: Document, path: string): SearchSection[] {
  const sections: SearchSection[] = [];
  const ids = new Set<string>();
  for (const element of doc.querySelectorAll<HTMLElement>('main [data-search="section"]')) {
    if (element.closest('[data-search-ignore]')) continue;
    const id = element.id;
    const title = element.dataset.searchTitle?.trim();
    if (!id || !title) throw new Error('Search sections need an ID and title');
    if (ids.has(id)) throw new Error(`Duplicate search anchor: ${id}`);
    ids.add(id);
    const content = element.cloneNode(true) as HTMLElement;
    // A nested promise is its own result, not repeated in every parent result.
    content.querySelectorAll('[data-search], [data-search-ignore], script, style, template, svg, nav, [aria-hidden="true"]').forEach(node => node.remove());
    // textContent does not insert spaces between block elements.
    content.querySelectorAll('p,div,li,tr,td,th,h1,h2,h3,h4,summary,br').forEach(node => node.append(' '));
    const text = normalize(content.textContent ?? '');
    if (!text) continue;
    const override = element.dataset.searchHref;
    const href = override && /^\/(?!\/)[^?]*#.+$/.test(override)
      ? override : `${path}#${encodeURIComponent(id)}`;
    sections.push({
      id: `${path}#${id}`, href, title,
      kind: element.dataset.searchKind || 'Section',
      project: element.dataset.searchProject,
      keywords: element.dataset.searchKeywords || '', text,
    });
  }
  return sections;
}

const indexes = new WeakMap<SearchSection[], Fuse<SearchSection>>();
export function searchSections(sections: SearchSection[], query: string): SearchSection[] {
  const tokens = normalize(query).slice(0, 160).toLocaleLowerCase().split(/\s+/).filter(Boolean).slice(0, 12);
  if (!tokens.length) return sections;
  let index = indexes.get(sections);
  if (!index) {
    index = new Fuse(sections, {
      includeScore: true, ignoreLocation: true, ignoreFieldNorm: true, threshold: 0.3,
      keys: [{name:'title',weight:0.4},{name:'project',weight:0.15},
        {name:'keywords',weight:0.15},{name:'kind',weight:0.05},{name:'text',weight:0.25}],
    });
    indexes.set(sections,index);
  }
  // Every query term must match; tokens can occur in different metadata/body fields.
  let scores: Map<string,{section:SearchSection;score:number}> | undefined;
  for (const token of tokens) {
    const matches = index.search(token);
    const next = new Map<string,{section:SearchSection;score:number}>();
    for (const {item,score} of matches) {
      const previous = scores?.get(item.id);
      if (!scores || previous) next.set(item.id,{section:item,score:(previous?.score ?? 0)+(score ?? 1)});
    }
    scores=next;
  }
  return [...(scores?.values() ?? [])].sort((a,b)=>a.score-b.score || a.section.title.localeCompare(b.section.title)).map(r=>r.section);
}

export function searchSnippet(section: SearchSection, query: string): string {
  const tokens = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const body = section.text.toLocaleLowerCase();
  const positions = tokens.map(token=>body.indexOf(token)).filter(i=>i>=0);
  const start = positions.length ? Math.max(0,Math.min(...positions)-55) : 0;
  const end = Math.min(section.text.length,start+220);
  return `${start ? '…' : ''}${section.text.slice(start,end)}${end<section.text.length ? '…' : ''}`;
}

// Browsers consume the shared daily index; they never crawl the site themselves.
// Keep a short response cache so route visits can observe a daily server refresh.
type Listener = (progress: SearchProgress) => void;
let responseCache: { at: number; progress: SearchProgress } | undefined;
let pending: Promise<SearchProgress> | undefined;

export function invalidateSearch() { responseCache = undefined; }

async function loadIndex(): Promise<SearchProgress> {
  if (responseCache && Date.now() - responseCache.at < 60_000) return responseCache.progress;
  if (!pending) {
    pending = fetch('/api/search-index', { headers: { Accept: 'application/json' } })
      .then(async response => {
        if (!response.ok) throw new Error('Search index unavailable');
        const value = await response.json();
        if (!Array.isArray(value.sections) || typeof value.total !== 'number') throw new Error('Invalid search index');
        const progress: SearchProgress = {
          sections: value.sections, completed: value.total, total: value.total, failed: value.failed.length,
        };
        responseCache = {at: Date.now(), progress};
        return progress;
      }).finally(() => { pending = undefined; });
  }
  return pending;
}

/** Called on occasional visits. The server's daily cache controls actual rebuilds. */
export function prewarmSearchIndex() { void loadIndex().catch(() => {}); }

export function subscribeSearch(paths: string[], listener: Listener): () => void {
  let subscribed = true;
  listener(responseCache?.progress ?? {sections: [], completed: 0, total: paths.length, failed: 0});
  void loadIndex().then(progress => {
    if (subscribed) listener(progress);
  }).catch(() => {
    if (subscribed) listener({
      sections: responseCache?.progress.sections ?? [], completed: paths.length, total: paths.length,
      failed: paths.length || 1,
    });
  });
  return () => { subscribed = false; };
}
