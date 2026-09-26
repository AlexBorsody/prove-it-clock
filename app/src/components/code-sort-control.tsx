"use client";
import { useSearchParams } from 'next/navigation';
import { CODE_SORTS, CODE_SORT_LABELS, parseCodeSort } from '@/lib/code-ranking';

export default function CodeSortControl() {
  const params = useSearchParams();
  const sort = parseCodeSort(params.get('sort'));
  return <form action="/code" method="get" className="code-sort-control">
    <label htmlFor="code-sort">Sort by</label>
    <select id="code-sort" name="sort" value={sort} onChange={event => {
      const url = new URL(window.location.href);
      const next = parseCodeSort(event.target.value);
      if (next === 'stars') url.searchParams.delete('sort');
      else url.searchParams.set('sort', next);
      window.history.pushState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }}>{CODE_SORTS.map(key => <option key={key} value={key}>{CODE_SORT_LABELS[key]} · highest first</option>)}</select>
    <noscript><button type="submit">Sort</button></noscript>
  </form>;
}
