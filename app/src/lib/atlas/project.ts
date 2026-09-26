import type { AtlasDataset } from './types';

/** Scope after layout so even newly published nodes keep their global coordinates. */
export function projectAtlas(data: AtlasDataset, slug: string): AtlasDataset {
  const nodes = data.nodes.filter(node => node.projectSlug === slug);
  const ids = new Set(nodes.map(node => node.id));
  const positions = data.positions.filter(position => ids.has(position.nodeId));
  return {
    ...data,
    nodes,
    positions,
    regions: data.regions.filter(region => positions.some(position =>
      position.x >= region.x && position.x <= region.x + region.width &&
      position.y >= region.y && position.y <= region.y + region.height)),
    coverage: {
      projects: nodes.length ? 1 : 0,
      unavailableProjects: data.coverage.unavailableProjects.filter(project => project === slug),
      layoutPending: data.coverage.layoutPending.filter(id => ids.has(id)),
    },
  };
}
