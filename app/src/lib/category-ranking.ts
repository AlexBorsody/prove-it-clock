/**
 * Per-category ranking by proven delivery.
 *
 * From the approved methodology review (2026-09-26-hearts-verdict-review.md):
 * - Use proven delivery for category ranking
 * - Show outcome coverage, raw kept/total and core findings alongside
 * - Never rank by resolved share alone
 * - With no resolved outcomes: show "No resolved outcomes", no ordinal rank
 * - Rank on full precision with ties; display rounded values
 * - Pin the same run, rules, admission and assignment versions
 */

import { evaluateThreeMeter, type ThreeMeterResult } from './three-meter';
import type { AtlasDataset, AtlasNode } from './atlas/types';
import { CATEGORIES, type CategoryId } from '../../data/atlas-taxonomy';
import { projectFlags } from './project-policy';

export interface CategoryRankingRow {
  slug: string;
  name: string;
  /** Ordinal rank, or null if unranked (no resolved outcomes or unavailable) */
  rank: number | null;
  /** The three-meter result for this project/category */
  verdict: ThreeMeterResult;
  /** Unweighted kept/total for display alongside */
  kept: number;
  total: number;
  /** Reason unranked, if applicable */
  unrankedReason: string | null;
}

export interface CategoryRanking {
  category: CategoryId;
  categoryLabel: string;
  rows: CategoryRankingRow[];
  /** Data revision this ranking is pinned to */
  dataRevision: string;
  methodologyVersion: string;
  asOf: string;
}

/**
 * Build a per-category ranking from the published Atlas dataset.
 * Ranks by proven delivery (weighted). Projects without weights or
 * without resolved outcomes are unranked but still listed.
 */
export function buildCategoryRanking(
  data: AtlasDataset,
  category: CategoryId
): CategoryRanking {
  const categoryMeta = CATEGORIES.find(c => c.id === category);
  const label = categoryMeta?.label ?? category;

  // Get all project slugs with nodes in this category
  const slugs = new Set<string>();
  for (const node of data.nodes) {
    if ((node.primaryCategory ?? 'unclassified') === category) {
      slugs.add(node.projectSlug);
    }
  }

  const rows: CategoryRankingRow[] = [];

  for (const slug of slugs) {
    // Genesis projects (Bitcoin) are excluded from delivery ranking
    if (projectFlags(slug).genesis) continue;

    const nodes = data.nodes.filter(
      n => n.projectSlug === slug && (n.primaryCategory ?? 'unclassified') === category
    );
    if (nodes.length === 0) continue;

    const verdict = evaluateThreeMeter(nodes);
    const kept = nodes.filter(n => n.state === 'kept').length;

    let rank: number | null = null;
    let unrankedReason: string | null = null;

    if (verdict.provenDelivery === null) {
      unrankedReason = verdict.unavailableReason || 'Weighted verdict unavailable';
    } else if (verdict.counts.R === 0) {
      unrankedReason = 'No resolved outcomes';
    }
    // else: rank assigned below after sorting

    // Get project name from first node
    const name = nodes[0]?.projectName ?? slug;

    rows.push({
      slug,
      name,
      rank,
      verdict,
      kept,
      total: nodes.length,
      unrankedReason,
    });
  }

  // Sort rankable rows by proven delivery (full precision), then name
  // Rank on full precision with ties; display rounded values
  const rankable = rows.filter(r => r.unrankedReason === null);
  rankable.sort((a, b) => {
    const aVal = a.verdict.provenDelivery ?? -1;
    const bVal = b.verdict.provenDelivery ?? -1;
    if (bVal !== aVal) return bVal - aVal;
    return a.name.localeCompare(b.name);
  });

  // Assign ordinal ranks with ties
  let rank = 0;
  let previous: number | null = null;
  for (let i = 0; i < rankable.length; i++) {
    const value = rankable[i].verdict.provenDelivery!;
    if (value !== previous) {
      rank = i + 1;
      previous = value;
    }
    rankable[i].rank = rank;
  }

  // Unranked rows go last, sorted by name
  const unranked = rows.filter(r => r.unrankedReason !== null);
  unranked.sort((a, b) => a.name.localeCompare(b.name));

  return {
    category,
    categoryLabel: label,
    rows: [...rankable, ...unranked],
    dataRevision: data.dataRevision,
    methodologyVersion: data.methodologyVersion,
    asOf: data.asOf,
  };
}

/**
 * Build rankings for all categories.
 */
export function buildAllCategoryRankings(
  data: AtlasDataset
): Map<CategoryId, CategoryRanking> {
  const result = new Map<CategoryId, CategoryRanking>();
  for (const category of CATEGORIES) {
    result.set(category.id, buildCategoryRanking(data, category.id));
  }
  return result;
}
