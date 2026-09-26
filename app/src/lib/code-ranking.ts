export const CODE_SORTS = ["stars", "forks", "watchers", "commits"] as const;
export type CodeSort = typeof CODE_SORTS[number];
export const CODE_SORT_LABELS: Record<CodeSort, string> = {
  stars: "Stars", forks: "Forks", watchers: "Watchers", commits: "Commits",
};

export function parseCodeSort(value: string | null): CodeSort {
  return CODE_SORTS.includes(value as CodeSort) ? value as CodeSort : "stars";
}

type SortableRow = {
  name: string; stars: number | null; forks: number | null;
  watchers: number | null; commits90d: number | null; failed: boolean;
};

export function sortCodeRows<T extends SortableRow>(rows: T[], sort: CodeSort): T[] {
  const value = (row: T) => {
    const metric = sort === "commits" ? (row.failed ? null : row.commits90d) : row[sort];
    return metric != null && Number.isFinite(metric) ? metric : -1;
  };
  return [...rows].sort((a, b) => value(b) - value(a) || a.name.localeCompare(b.name));
}
