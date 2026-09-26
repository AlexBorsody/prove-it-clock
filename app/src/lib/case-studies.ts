import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Explicit allowlist: route parameters must never become filesystem paths.
export const CASE_STUDY_DOCUMENTS = {
  overview: { title: "Research protocol", file: "archive/case-studies-2026-09-25/README.md" },
  bat: { title: "BAT evidence", file: "archive/case-studies-2026-09-25/bat.md" },
  xrp: { title: "XRP evidence", file: "archive/case-studies-2026-09-25/xrp.md" },
  btc: { title: "BTC evidence", file: "archive/case-studies-2026-09-25/btc.md" },
  link: { title: "LINK evidence", file: "archive/case-studies-2026-09-25/link.md" },
  eth: { title: "ETH evidence", file: "archive/case-studies-2026-09-25/eth.md" },
  sol: { title: "SOL evidence", file: "archive/case-studies-2026-09-25/sol.md" },
  dash: { title: "DASH evidence", file: "archive/case-studies-2026-09-25/dash.md" },
  avax: { title: "AVAX evidence", file: "archive/case-studies-2026-09-25/avax.md" },
  review: { title: "Review questions & checks", file: "archive/case-studies-2026-09-25/review.md" },
  // The algorithm lives as an appendix section inside implementation.md
  // (docs reorganization 2026-09-25); the route extracts just that section.
  algorithm: { title: "Adopted heart rules", file: "implementation.md" },
} as const;

/** Documents served as an extracted section of a larger file. */
const DOCUMENT_SECTIONS: Partial<
  Record<CaseStudySlug, { start: string; end: string }>
> = {
  algorithm: { start: "<!-- ALGORITHM-START -->", end: "<!-- ALGORITHM-END -->" },
};

/** Repo file names that moved; keep old Markdown links resolving. */
const LEGACY_FILES: Record<string, CaseStudySlug> = {
  "hearts-algorithm.md": "algorithm",
};

export type CaseStudySlug = keyof typeof CASE_STUDY_DOCUMENTS;

export function isCaseStudySlug(slug: string): slug is CaseStudySlug {
  return Object.hasOwn(CASE_STUDY_DOCUMENTS, slug);
}

export function caseStudyHref(slug: CaseStudySlug): string {
  return slug === "overview" ? "/case-studies" : `/case-studies/${slug}`;
}

export async function readCaseStudy(slug: CaseStudySlug): Promise<string> {
  // Next runs from app/. These files are rendered at build time and traced for
  // deployments; missing content fails visibly rather than producing empty pages.
  const raw = await readFile(join(process.cwd(), "..", "docs", CASE_STUDY_DOCUMENTS[slug].file), "utf8");
  const markers = DOCUMENT_SECTIONS[slug];
  if (!markers) return raw;
  const start = raw.indexOf(markers.start);
  const end = raw.indexOf(markers.end);
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(`section markers missing for case-study document: ${slug}`);
  }
  return raw.slice(start + markers.start.length, end).trim() + "\n";
}

/** Resolve repo Markdown links to review pages, retaining external source URLs. */
export function resolveCaseStudyLink(href: string, slug: CaseStudySlug): string {
  if (href.startsWith("#") || /^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith("/")) {
    return href;
  }
  const base = new URL(`https://github.com/AlexBorsody/prove-it-clock/blob/main/docs/${CASE_STUDY_DOCUMENTS[slug].file}`);
  const resolved = new URL(href, base);
  const legacy = LEGACY_FILES[resolved.pathname.split("/").pop() ?? ""];
  if (legacy) return caseStudyHref(legacy) + resolved.hash;
  for (const [key, document] of Object.entries(CASE_STUDY_DOCUMENTS)) {
    if (resolved.pathname === `/AlexBorsody/prove-it-clock/blob/main/docs/${document.file}`) {
      return caseStudyHref(key as CaseStudySlug) + resolved.hash;
    }
  }
  return resolved.href;
}
