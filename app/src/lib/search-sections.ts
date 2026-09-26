/** Shared HTML contract: every searchable record belongs to a real, stable anchor. */
export function searchMeta(section: {
  id: string;
  title: string;
  kind: string;
  project?: string;
  keywords?: string;
}) {
  return {
    id: section.id,
    'data-search': 'section',
    'data-search-title': section.title,
    'data-search-kind': section.kind,
    'data-search-project': section.project,
    'data-search-keywords': section.keywords,
  };
}

/** Public HTML pages only. No API, query-string variants, or arbitrary crawling. */
export function siteSearchPaths(projectSlugs: string[], caseStudySlugs: string[]): string[] {
  return [...new Set([
    '/', '/atlas', '/methodology', '/code', '/hype', '/compare', '/developers', '/case-studies',
    ...projectSlugs.filter(s => /^[a-z0-9-]+$/.test(s)).map(s => `/projects/${s}`),
    ...caseStudySlugs.filter(s => s !== 'overview' && /^[a-z0-9-]+$/.test(s)).map(s => `/case-studies/${s}`),
  ])];
}
