import type { CategoryId, AtlasTag } from '../../../data/atlas-taxonomy';
export const ATLAS_STATES = ['kept', 'open', 'in_progress', 'lapsed', 'retired', 'unknown'] as const;
export type AtlasState = typeof ATLAS_STATES[number];
export const STATE_LABELS: Record<AtlasState, string> = { kept: 'Kept', open: 'Open', in_progress: 'In progress', lapsed: 'Lapsed', retired: 'Retired', unknown: 'Unknown' };
export interface AtlasSource { url: string; title?: string; publishedAt?: string; locator?: string; quote?: string }
export interface AtlasAssignment {
  primary: CategoryId | null; secondary: CategoryId[]; tags: AtlasTag[];
  rationale: string; author: string; reviewedBy?: string;
}
export interface AtlasNode {
  id: string; lineageId: string; sourceRunId: string;
  projectSlug: string; projectName: string; symbol: string;
  claimText: string; claimTextKind: 'quote' | 'published-description' | 'published-criteria';
  state: AtlasState; originalState: string; core: boolean;
  assessmentExplanation: string | null; assessedAt: string | null; snapshotAsOf: string;
  claimSources: AtlasSource[]; outcomeEvidence: AtlasSource[]; evidenceRolesSeparated: boolean;
  fulfillmentTest: string | null;
  primaryCategory: CategoryId | null; secondaryCategories: CategoryId[]; tags: AtlasTag[];
  assignmentRationale: string | null; assignmentAuthor: string | null;
  projectHref: string; promiseHref: string; qualityFlags: string[];
}
export interface AtlasPosition { nodeId: string; x: number; y: number }
export interface AtlasRegion { id: CategoryId; label: string; x: number; y: number; width: number; height: number }
export interface AtlasDataset {
  dataRevision: string; methodologyVersion: string; taxonomyVersion: string;
  assignmentVersion: string; layoutVersion: string; asOf: string;
  positioningMethod: 'curated-category'; nodes: AtlasNode[];
  positions: AtlasPosition[]; regions: AtlasRegion[];
  coverage: { projects: number; unavailableProjects: string[]; layoutPending: string[] };
}
export interface PublishedRun { id: string; as_of: string; methodology: string; review_status?: string }
export interface PublishedHeartDataset { run: PublishedRun | null; projects: unknown[] }
export const promiseId = (project: string, lineage: string) => `${encodeURIComponent(project)}:${encodeURIComponent(lineage)}`;
