/**
 * Public v2 API data layer: three-meter verdicts, per-category rankings,
 * and the promise ledger with evidence.
 *
 * Built on the approved methodology (2026-09-26-hearts-verdict-review):
 * one published promise ledger feeds hearts, verdict, categories and receipts.
 *
 * Every number resolves to its source records. Pinned to data revision
 * and methodology version. Unavailable weighted metrics are null, never
 * invented zeros.
 */
import { getPublishedAtlas } from "@/lib/atlas/data";
import {
  evaluateThreeMeter,
  evaluateThreeMeterByCategory,
  type ThreeMeterResult,
} from "@/lib/three-meter";
import { buildCategoryRanking } from "@/lib/category-ranking";
import { CATEGORIES, type CategoryId } from "../../data/atlas-taxonomy";
import type { AtlasDataset, AtlasNode } from "@/lib/atlas/types";
import { projectFlags } from "@/lib/project-policy";

export interface ApiMeta {
  data_revision: string;
  methodology_version: string;
  taxonomy_version: string;
  as_of: string;
}

export interface ApiEnvelope<T> {
  data: T;
  meta: ApiMeta;
}

export interface VerdictPayload {
  proven_delivery: number | null;
  outcome_coverage: number | null;
  kept_among_resolved: number | null;
  core_finding: ThreeMeterResult["coreFinding"];
  unavailable_reason: string | null;
  weights: {
    total: number;
    kept: number;
    failed: number;
    open: number;
    unknown: number;
    resolved: number;
  };
}

export interface ProjectVerdict {
  slug: string;
  name: string;
  symbol: string;
  genesis: boolean;
  hearts: { kept: number; total: number };
  verdict: VerdictPayload;
  categories: Record<string, VerdictPayload>;
}

function toVerdictPayload(result: ThreeMeterResult): VerdictPayload {
  return {
    proven_delivery: result.provenDelivery,
    outcome_coverage: result.outcomeCoverage,
    kept_among_resolved: result.keptAmongResolved,
    core_finding: result.coreFinding,
    unavailable_reason: result.unavailableReason,
    weights: {
      total: result.counts.W,
      kept: result.counts.K,
      failed: result.counts.F,
      open: result.counts.O,
      unknown: result.counts.U,
      resolved: result.counts.R,
    },
  };
}

function metaFrom(data: AtlasDataset): ApiMeta {
  return {
    data_revision: data.dataRevision,
    methodology_version: data.methodologyVersion,
    taxonomy_version: data.taxonomyVersion,
    as_of: data.asOf,
  };
}

function projectSlugs(data: AtlasDataset): string[] {
  const slugs = new Set<string>();
  for (const node of data.nodes) slugs.add(node.projectSlug);
  return [...slugs].sort();
}

function nodeProjectName(nodes: AtlasNode[]): { name: string; symbol: string } {
  const n = nodes[0];
  return { name: n?.projectName ?? "", symbol: n?.symbol ?? "" };
}

export async function getVerdicts(): Promise<ApiEnvelope<ProjectVerdict[]>> {
  const data = await getPublishedAtlas();
  if (!data) throw new Error("Promise ledger unavailable");
  const meta = metaFrom(data);
  const verdicts: ProjectVerdict[] = [];

  for (const slug of projectSlugs(data)) {
    if (data.coverage.unavailableProjects.includes(slug)) continue;
    const nodes = data.nodes.filter((n) => n.projectSlug === slug);
    if (!nodes.length) continue;
    const { name, symbol } = nodeProjectName(nodes);
    const overall = evaluateThreeMeter(nodes);
    const byCategory = evaluateThreeMeterByCategory(nodes);
    const categories: Record<string, VerdictPayload> = {};
    for (const [catId, result] of Object.entries(byCategory)) {
      // Only include categories with nodes
      const catNodes = nodes.filter(
        (n) => (n.primaryCategory ?? "unclassified") === catId
      );
      if (catNodes.length > 0) categories[catId] = toVerdictPayload(result);
    }
    verdicts.push({
      slug,
      name,
      symbol,
      genesis: projectFlags(slug).genesis,
      hearts: {
        kept: nodes.filter((n) => n.state === "kept").length,
        total: nodes.length,
      },
      verdict: toVerdictPayload(overall),
      categories,
    });
  }

  return { data: verdicts, meta };
}

export async function getVerdictDetail(
  slug: string
): Promise<ApiEnvelope<ProjectVerdict> | null> {
  const data = await getPublishedAtlas();
  if (!data) throw new Error("Promise ledger unavailable");
  if (data.coverage.unavailableProjects.includes(slug)) return null;
  const nodes = data.nodes.filter((n) => n.projectSlug === slug);
  if (!nodes.length) return null;
  const { name, symbol } = nodeProjectName(nodes);
  const overall = evaluateThreeMeter(nodes);
  const byCategory = evaluateThreeMeterByCategory(nodes);
  const categories: Record<string, VerdictPayload> = {};
  for (const [catId, result] of Object.entries(byCategory)) {
    const catNodes = nodes.filter(
      (n) => (n.primaryCategory ?? "unclassified") === catId
    );
    if (catNodes.length > 0) categories[catId] = toVerdictPayload(result);
  }
  return {
    data: {
      slug,
      name,
      symbol,
      genesis: projectFlags(slug).genesis,
      hearts: {
        kept: nodes.filter((n) => n.state === "kept").length,
        total: nodes.length,
      },
      verdict: toVerdictPayload(overall),
      categories,
    },
    meta: metaFrom(data),
  };
}

export interface RankingRowPayload {
  rank: number | null;
  slug: string;
  name: string;
  proven_delivery: number | null;
  outcome_coverage: number | null;
  kept_among_resolved: number | null;
  core_finding: ThreeMeterResult["coreFinding"];
  hearts: { kept: number; total: number };
  unranked_reason: string | null;
}

export async function getCategoryRanking(
  category: CategoryId
): Promise<ApiEnvelope<{
  category: CategoryId;
  category_label: string;
  rows: RankingRowPayload[];
}> | null> {
  const data = await getPublishedAtlas();
  if (!data) throw new Error("Promise ledger unavailable");
  if (!CATEGORIES.some((c) => c.id === category)) return null;
  const ranking = buildCategoryRanking(data, category);
  return {
    data: {
      category: ranking.category,
      category_label: ranking.categoryLabel,
      rows: ranking.rows.map((r) => ({
        rank: r.rank,
        slug: r.slug,
        name: r.name,
        proven_delivery: r.verdict.provenDelivery,
        outcome_coverage: r.verdict.outcomeCoverage,
        kept_among_resolved: r.verdict.keptAmongResolved,
        core_finding: r.verdict.coreFinding,
        hearts: { kept: r.kept, total: r.total },
        unranked_reason: r.unrankedReason,
      })),
    },
    meta: metaFrom(data),
  };
}

export interface PromisePayload {
  id: string;
  project_slug: string;
  claim_text: string;
  state: string;
  core: boolean;
  importance: string | null;
  category: string | null;
  fulfillment_test: string | null;
  claim_sources: { url: string; title?: string }[];
  outcome_evidence: { url: string; title?: string }[];
  assessed_at: string | null;
}

export async function getPromises(opts: {
  project?: string;
  category?: string;
  state?: string;
  page: number;
  perPage: number;
}): Promise<ApiEnvelope<{ promises: PromisePayload[]; total: number; page: number; per_page: number }>> {
  const data = await getPublishedAtlas();
  if (!data) throw new Error("Promise ledger unavailable");
  let nodes = data.nodes;
  if (opts.project) nodes = nodes.filter((n) => n.projectSlug === opts.project);
  if (opts.category)
    nodes = nodes.filter(
      (n) => (n.primaryCategory ?? "unclassified") === opts.category
    );
  if (opts.state) nodes = nodes.filter((n) => n.state === opts.state);

  const total = nodes.length;
  const start = (opts.page - 1) * opts.perPage;
  const page = nodes.slice(start, start + opts.perPage);

  return {
    data: {
      promises: page.map((n) => ({
        id: n.id,
        project_slug: n.projectSlug,
        claim_text: n.claimText,
        state: n.state,
        core: n.core,
        importance: n.importance ?? null,
        category: n.primaryCategory,
        fulfillment_test: n.fulfillmentTest,
        claim_sources: n.claimSources.map((s) => ({ url: s.url, title: s.title })),
        outcome_evidence: n.outcomeEvidence.map((s) => ({ url: s.url, title: s.title })),
        assessed_at: n.assessedAt,
      })),
      total,
      page: opts.page,
      per_page: opts.perPage,
    },
    meta: metaFrom(data),
  };
}

export async function getMethodology(): Promise<ApiEnvelope<{
  methodology_version: string;
  taxonomy_version: string;
  data_revision: string;
  as_of: string;
  meters: { name: string; formula: string; description: string }[];
  weights: { tier: string; weight: number; description: string }[];
  states: { state: string; partition: string; description: string }[];
}>> {
  const data = await getPublishedAtlas();
  if (!data) throw new Error("Promise ledger unavailable");
  return {
    data: {
      methodology_version: data.methodologyVersion,
      taxonomy_version: data.taxonomyVersion,
      data_revision: data.dataRevision,
      as_of: data.asOf,
      meters: [
        {
          name: "proven_delivery",
          formula: "100 * K / W",
          description:
            "Weighted share of all tracked commitments demonstrably kept. K = kept weight, W = total tracked weight.",
        },
        {
          name: "outcome_coverage",
          formula: "100 * R / W",
          description:
            "Weighted share of tracked commitments with resolved outcomes. R = kept + failed weight.",
        },
        {
          name: "kept_among_resolved",
          formula: "100 * K / R",
          description:
            "Kept share among resolved promises only. Breakdown detail, never a standalone verdict or ranking.",
        },
      ],
      weights: [
        { tier: "supporting", weight: 1, description: "Useful distinct commitment, not necessary to the stated central function." },
        { tier: "material", weight: 2, description: "Substantial user-facing capability or necessary support for the central function." },
        { tier: "core", weight: 4, description: "The single core commitment defining the project's stated function." },
      ],
      states: [
        { state: "kept", partition: "K", description: "Kept under its original test, with sufficient evidence." },
        { state: "lapsed", partition: "F", description: "Confirmed unkept ongoing condition." },
        { state: "retired", partition: "F", description: "Obligation withdrawn before its test was met." },
        { state: "open", partition: "O", description: "Pending, including reviewed progress without fulfillment." },
        { state: "in_progress", partition: "O", description: "Reviewed progress without fulfillment." },
        { state: "unknown", partition: "U", description: "Disputed assessment, or evidence too stale for a current judgment." },
      ],
    },
    meta: metaFrom(data),
  };
}
