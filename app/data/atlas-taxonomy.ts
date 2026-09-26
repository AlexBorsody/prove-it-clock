export const TAXONOMY_VERSION = 'atlas-taxonomy-v1';
export const CATEGORIES = [
  { id: 'money', label: 'Money / Store of Value', short: 'Money', definition: 'Money, savings and monetary instruments.' },
  { id: 'payments', label: 'Payments / Settlement', short: 'Payments', definition: 'Transferring value, paying recipients and settling obligations.' },
  { id: 'platform', label: 'Platform / Compute', short: 'Platform', definition: 'Applications, smart contracts and computation.' },
  { id: 'defi', label: 'Financial Infrastructure / DeFi', short: 'DeFi', definition: 'Lending, exchanges, collateral and financial services.' },
  { id: 'privacy', label: 'Privacy', short: 'Privacy', definition: 'Confidentiality of transactions, identity and data.' },
  { id: 'interoperability', label: 'Interoperability', short: 'Interop', definition: 'Communication or transfer between separate systems.' },
  { id: 'governance', label: 'Governance', short: 'Governance', definition: 'Decisions, upgrades and participation.' },
  { id: 'real-world', label: 'Real-world Integration', short: 'Real-world', definition: 'Connecting on-chain systems to external assets, institutions or processes.' },
  { id: 'unclassified', label: 'Unclassified', short: 'Unclassified', definition: 'An assignment is missing or the subject needs review.' },
] as const;
export type CategoryId = typeof CATEGORIES[number]['id'];
export const TAGS = ['scale', 'inclusion', 'sovereignty'] as const;
export type AtlasTag = typeof TAGS[number];
export const categoryLabel = (id: CategoryId | null) => CATEGORIES.find(c => c.id === (id ?? 'unclassified'))!.label;
