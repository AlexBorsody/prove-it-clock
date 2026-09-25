import Markdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  CASE_STUDY_DOCUMENTS, caseStudyHref, readCaseStudy, resolveCaseStudyLink,
  type CaseStudySlug,
} from "@/lib/case-studies";

export default async function CaseStudyDocument({ slug }: { slug: CaseStudySlug }) {
  const markdown = await readCaseStudy(slug);
  return (
    <main className="research">
      <aside className="research-notice" aria-label="Research status">
        <strong>Research draft — methodology adopted 2026-09-25, three review questions still open</strong>
        <p>Reviewed case studies under the claim-type rule, not a blinded replication.
          No published heart rating until the open questions in the review close.</p>
      </aside>
      <nav className="research-nav" aria-label="Case studies">
        {Object.entries(CASE_STUDY_DOCUMENTS).map(([key, document]) => (
          <a key={key} href={caseStudyHref(key as CaseStudySlug)} aria-current={key === slug ? "page" : undefined}>
            {document.title}
          </a>
        ))}
      </nav>
      <article className="research-document">
        <Markdown
          remarkPlugins={[remarkGfm]}
          skipHtml
          urlTransform={(url) => defaultUrlTransform(resolveCaseStudyLink(url, slug))}
          components={{
            table: ({ children }) => (
              <div className="research-table" tabIndex={0} role="region" aria-label="Research table; scroll horizontally on smaller screens">
                <table>{children}</table>
              </div>
            ),
          }}
        >{markdown}</Markdown>
      </article>
      <p className="research-source">
        Review content comes from <code>docs/{CASE_STUDY_DOCUMENTS[slug].file}</code>.
        Edit the Markdown and rebuild to update this page. Checklist boxes are read-only.
      </p>
    </main>
  );
}
