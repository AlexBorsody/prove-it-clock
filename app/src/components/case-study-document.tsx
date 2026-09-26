import Link from "next/link";
import Markdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Blockquote, Root, RootContent } from "mdast";
import Icon from "@/components/chrome-icons";
import { searchMeta } from "@/lib/search-sections";
import {
  CASE_STUDY_DOCUMENTS, caseStudyHref, readCaseStudy, resolveCaseStudyLink,
  type CaseStudySlug,
} from "@/lib/case-studies";

type TextNode = { type: string; value?: string; alt?: string | null; children?: TextNode[] };

function nodeText(node: TextNode): string {
  return node.value ?? node.alt ?? node.children?.map(nodeText).join("") ?? "";
}

/** Index actual Markdown blocks, keeping every heading with its following body. */
function searchableResearchSections(slug: CaseStudySlug) {
  return function remarkSearchSections() {
    return function transform(tree: Root) {
      const sections: RootContent[] = [];
      const used = new Map<string, number>([["introduction", 1]]);
      let children: RootContent[] = [];
      let title = CASE_STUDY_DOCUMENTS[slug].title as string;
      let anchor = "introduction";

      function flush() {
        if (!children.length) return;
        sections.push({
          type: "blockquote",
          data: {
            hName: "section",
            hProperties: {
              ...searchMeta({
                id: `case-study-${slug}-${anchor}`,
                title: `${CASE_STUDY_DOCUMENTS[slug].title}: ${title}`,
                kind: CASE_STUDY_DOCUMENTS[slug].file.startsWith("archive/") ? "Historical research" : "Research",
                project: ["overview", "review", "algorithm"].includes(slug) ? undefined : slug,
              }),
              className: ["research-section", "search-section"],
            },
          },
          children: children as Blockquote["children"],
        });
        children = [];
      }

      for (const node of tree.children) {
        if (node.type === "heading") {
          flush();
          title = nodeText(node);
          const base = title.toLowerCase().replace(/[^\p{Letter}\p{Number}]+/gu, "-").replace(/^-|-$/g, "") || "section";
          const count = used.get(base) ?? 0;
          used.set(base, count + 1);
          anchor = count ? `${base}-${count}` : base;
          // Keep conventional Markdown fragments working alongside namespaced
          // container anchors used by site search.
          node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id: anchor } };
        }
        children.push(node);
      }
      flush();
      tree.children = sections;
    };
  };
}

export default async function CaseStudyDocument({ slug }: { slug: CaseStudySlug }) {
  const markdown = await readCaseStudy(slug);
  const isHistorical = CASE_STUDY_DOCUMENTS[slug].file.startsWith("archive/");
  return (
    <main className="research">
      {isHistorical ? (
        <aside className="research-notice" aria-label="Historical record">
          <strong>
            <Icon name="doc" size={15} style={{ marginRight: 8 }} />
            Historical record: worksheet from the 2026-09-25 scoring session
          </strong>
          <p>Promise data now lives in the published runs. Current scoring follows the methodology page.</p>
        </aside>
      ) : null}
      <aside className="research-notice" aria-label="Research status">
        <strong>
          <Icon name="flask" size={15} style={{ marginRight: 8 }} />
          Research notes: single-analyst assessment, not a blinded replication
        </strong>
        <p>Evidence was gathered by one analyst and is published for anyone to check.
          Blinded replication by an independent analyst would upgrade a score to verified.</p>
      </aside>
      <nav className="research-nav" aria-label="Case studies">
        {Object.entries(CASE_STUDY_DOCUMENTS).map(([key, document]) => (
          <a key={key} href={caseStudyHref(key as CaseStudySlug)} aria-current={key === slug ? "page" : undefined}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Icon name="doc" size={13} />
              {document.title}
            </span>
          </a>
        ))}
      </nav>
      <article className="research-document">
        <Markdown
          remarkPlugins={[remarkGfm, searchableResearchSections(slug)]}
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
        Scoring follows the <Link href="/methodology">published methodology</Link>.
        Checklist boxes are read-only.
      </p>
    </main>
  );
}
