/**
 * Three-meter verdict engine.
 *
 * From the approved methodology review (2026-09-26-hearts-verdict-review.md):
 * one published promise ledger feeds hearts, verdict, categories and receipts.
 *
 * Three meters:
 * - Proven delivery = 100 * K / W (weighted share of kept promises)
 * - Outcome coverage = 100 * R / W (weighted share of resolved promises)
 * - Kept among resolved = 100 * K / R (breakdown only, never standalone)
 *
 * Where:
 * - K = kept weight (state = kept, with sufficient evidence)
 * - F = failed weight (state = lapsed, or retired with a reviewed
 *   fulfillment judgment of lapsed)
 * - O = open weight (state = open, in_progress, reviewed but unfulfilled)
 * - U = unknown weight (state = unknown, disputed, stale evidence, or
 *   retired without a reviewed fulfillment judgment)
 * - W = K + F + O + U (total tracked weight)
 * - R = K + F (resolved weight)
 *
 * Retirement is a lifecycle state, not an outcome. A retired promise with
 * no reviewed fulfillment judgment is unknown: "Retired alone is
 * insufficient to determine fulfillment." It joins K or F only through
 * an explicit reviewed fulfillment field, never by default.
 *
 * Weights: supporting = 1, material = 2, core = 4.
 * Missing weights make weighted output unavailable. No invented defaults.
 */

import type { AtlasNode, AtlasState } from './atlas/types';
import { CATEGORIES, type CategoryId } from '../../data/atlas-taxonomy';

export type Importance = 'supporting' | 'material' | 'core';
export const IMPORTANCE_WEIGHTS: Record<Importance, number> = {
  supporting: 1,
  material: 2,
  core: 4,
};

export interface WeightedCounts {
  /** Total weight of all tracked promises */
  W: number;
  /** Kept weight */
  K: number;
  /** Failed weight (lapsed, retired unmet, confirmed missed) */
  F: number;
  /** Open weight (pending, in progress) */
  O: number;
  /** Unknown weight (disputed, stale, unavailable) */
  U: number;
  /** Resolved weight (K + F) */
  R: number;
  /** Count of promises with weights */
  weightedCount: number;
  /** Count of promises without weights */
  unweightedCount: number;
}

export interface ThreeMeterResult {
  /** Proven delivery: 100 * K / W, or null if unavailable */
  provenDelivery: number | null;
  /** Outcome coverage: 100 * R / W, or null if unavailable */
  outcomeCoverage: number | null;
  /** Kept among resolved: 100 * K / R, or null if unavailable (breakdown only) */
  keptAmongResolved: number | null;
  /** Raw counts for the receipt */
  counts: WeightedCounts;
  /** IDs of promises contributing to each partition */
  contributors: {
    kept: string[];
    failed: string[];
    open: string[];
    unknown: string[];
  };
  /** Core finding: kept, lapsed, unresolved, or unavailable */
  coreFinding: 'kept' | 'lapsed' | 'unresolved' | 'unavailable' | 'none';
  /** Reason weights are unavailable, if applicable */
  unavailableReason: string | null;
}

/**
 * Map a node to its K/F/O/U partition.
 * Retirement is separated from fulfillment: a retired promise counts as
 * kept or failed only when a reviewed fulfillment judgment exists.
 * Without one, retired is unknown. This follows the review: "Retired
 * alone is insufficient to determine fulfillment."
 */
function partitionNode(node: AtlasNode): 'K' | 'F' | 'O' | 'U' {
  switch (node.state) {
    case 'kept':
      return 'K';
    case 'lapsed':
      return 'F';
    case 'retired':
      if (node.fulfillment === 'kept') return 'K';
      if (node.fulfillment === 'lapsed') return 'F';
      return 'U';
    case 'open':
    case 'in_progress':
      return 'O';
    case 'unknown':
    default:
      return 'U';
  }
}

/**
 * Get the weight for a node. Returns null if no weight is assigned.
 * Weight comes from the node's reviewed importance field.
 * No invented defaults: missing importance means weighted metrics unavailable.
 */
export function getNodeWeight(node: AtlasNode): number | null {
  const importance = node.importance;
  if (importance && IMPORTANCE_WEIGHTS[importance]) {
    return IMPORTANCE_WEIGHTS[importance];
  }
  return null;
}

export function evaluateThreeMeter(nodes: AtlasNode[]): ThreeMeterResult {
  const counts: WeightedCounts = {
    W: 0, K: 0, F: 0, O: 0, U: 0, R: 0,
    weightedCount: 0, unweightedCount: 0,
  };
  const contributors = {
    kept: [] as string[],
    failed: [] as string[],
    open: [] as string[],
    unknown: [] as string[],
  };

  let coreKept = false;
  let coreFailed = false;
  let coreOpen = false;
  let hasCore = false;

  for (const node of nodes) {
    const weight = getNodeWeight(node);
    const partition = partitionNode(node);
    const id = node.id;

    if (weight === null) {
      counts.unweightedCount++;
      continue;
    }

    counts.weightedCount++;
    counts.W += weight;

    switch (partition) {
      case 'K':
        counts.K += weight;
        contributors.kept.push(id);
        break;
      case 'F':
        counts.F += weight;
        contributors.failed.push(id);
        break;
      case 'O':
        counts.O += weight;
        contributors.open.push(id);
        break;
      case 'U':
        counts.U += weight;
        contributors.unknown.push(id);
        break;
    }

    // Track core finding
    if (node.core) {
      hasCore = true;
      if (partition === 'K') coreKept = true;
      else if (partition === 'F') coreFailed = true;
      else if (partition === 'O') coreOpen = true;
    }
  }

  counts.R = counts.K + counts.F;

  // Determine core finding
  let coreFinding: ThreeMeterResult['coreFinding'] = 'none';
  if (hasCore) {
    if (coreFailed) coreFinding = 'lapsed';
    else if (coreKept) coreFinding = 'kept';
    else if (coreOpen) coreFinding = 'unresolved';
    else coreFinding = 'unavailable';
  }

  // Calculate meters, or null if unavailable
  let provenDelivery: number | null = null;
  let outcomeCoverage: number | null = null;
  let keptAmongResolved: number | null = null;
  let unavailableReason: string | null = null;

  if (counts.W === 0) {
    if (nodes.length === 0) {
      unavailableReason = 'No tracked promises in scope.';
    } else if (counts.unweightedCount > 0) {
      unavailableReason = `Weighted verdict unavailable: ${counts.unweightedCount} promise(s) lack reviewed importance weights.`;
    } else {
      unavailableReason = 'No weighted promises in scope.';
    }
  } else {
    provenDelivery = (counts.K / counts.W) * 100;
    outcomeCoverage = (counts.R / counts.W) * 100;
    if (counts.R > 0) {
      keptAmongResolved = (counts.K / counts.R) * 100;
    }
  }

  return {
    provenDelivery,
    outcomeCoverage,
    keptAmongResolved,
    counts,
    contributors,
    coreFinding,
    unavailableReason,
  };
}

/**
 * Evaluate three meters per category for a project's nodes.
 */
export function evaluateThreeMeterByCategory(
  nodes: AtlasNode[]
): Record<CategoryId, ThreeMeterResult> {
  const result = {} as Record<CategoryId, ThreeMeterResult>;
  for (const category of CATEGORIES) {
    const categoryNodes = nodes.filter(
      node => (node.primaryCategory ?? 'unclassified') === category.id
    );
    result[category.id] = evaluateThreeMeter(categoryNodes);
  }
  return result;
}

/**
 * Format a meter value for display. Returns "—" for null.
 */
export function formatMeter(value: number | null, decimals = 1): string {
  if (value === null) return '—';
  return `${value.toFixed(decimals)}%`;
}
