import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Explicit allowlist: route parameters must never become filesystem paths.
export const CASE_STUDY_DOCUMENTS = {
  overview: { title: "Research protocol", file: "case-studies/README.md" },
  bat: { title: "BAT evidence", file: "case-studies/bat.md" },
  xrp: { title: "XRP evidence", file: "case-studies/xrp.md" },
  btc: { title: "BTC evidence", file: "case-studies/btc.md" },
  link: { title: "LINK evidence", file: "case-studies/link.md" },
  eth: { title: "ETH evidence", file: "case-studies/eth.md" },
  sol: { title: "SOL evidence", file: "case-studies/sol.md" },
  dash: { title: "DASH evidence", file: "case-studies/dash.md" },
  avax: { title: "AVAX evidence", file: "case-studies/avax.md" },
  review: { title: "Review questions & checks", file: "case-studies/review.md" },
  algorithm: { title: "Adopted heart rules", file: "hearts-algorithm.md" },
} as const;

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
  return readFile(join(process.cwd(), "..", "docs", CASE_STUDY_DOCUMENTS[slug].file), "utf8");
}

/** Resolve repo Markdown links to review pages, retaining external source URLs. */
export function resolveCaseStudyLink(href: string, slug: CaseStudySlug): string {
  if (href.startsWith("#") || /^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith("/")) {
    return href;
  }
  const base = new URL(`https://github.com/AlexBorsody/prove-it-clock/blob/main/docs/${CASE_STUDY_DOCUMENTS[slug].file}`);
  const resolved = new URL(href, base);
  for (const [key, document] of Object.entries(CASE_STUDY_DOCUMENTS)) {
    if (resolved.pathname === `/AlexBorsody/prove-it-clock/blob/main/docs/${document.file}`) {
      return caseStudyHref(key as CaseStudySlug) + resolved.hash;
    }
  }
  return resolved.href;
}
