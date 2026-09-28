'use client';

import Link from 'next/link';
import {
  ComparisonGrid,
  type ComparisonGroup,
} from '@/components/compare-table';
import { METRICS, metricText } from '@/lib/stocks/context';
import type { StockOverviewRecord } from '@/components/stock-overview-context';

/** Company facts stay in a separate contract from crypto promise metrics. */
export default function StockCompareTable({
  records,
}: {
  records: StockOverviewRecord[];
}) {
  const rows: ComparisonGroup['rows'] = [
    {
      key: 'company',
      label: 'Company',
      title: 'Company',
      cells: records.map(({ company }) => company.name),
    },
    {
      key: 'listing',
      label: 'Listing',
      title: 'Listing',
      cells: records.map(({ company }) => company.ticker ?? 'Private'),
    },
    ...METRICS.map(([key, label]) => ({
      key,
      label,
      title: label,
      cells: records.map(({ context }) => (
        <span key={key}>
          {metricText(key, context)}
          {context.metrics[key] && (
            <small style={{ display: 'block' }}>
              {context.metrics[key]!.period}
              <br />
              <a
                href={context.metrics[key]!.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {context.metrics[key]!.source}
              </a>
            </small>
          )}
        </span>
      )),
    })),
  ];
  return (
    <ComparisonGrid
      id="stock-compare-metrics"
      rowIdPrefix="stock-compare"
      title="Business and market context"
      keywords="company fundamentals revenue profit cash flow"
      columns={records.map(({ company }) => ({
        key: company.slug,
        header: <Link href={`/stocks/${company.slug}`}>{company.name}</Link>,
      }))}
      groups={[{ label: 'Business and market context', rows }]}
    />
  );
}
