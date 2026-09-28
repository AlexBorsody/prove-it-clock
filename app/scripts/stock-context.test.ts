import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { normalizeOverview } from '../src/lib/stocks/providers';
import { normalizeSec } from '../src/lib/stocks/sec';
import {
  metricText,
  matchesScreen,
  type StockContext,
} from '../src/lib/stocks/context';
import { dateRange, timelinePoints } from '../src/lib/stocks/timeline';
import { lineageState, type StockLineage } from '../src/lib/stocks/ledger';
import { getStockLedger } from '../src/lib/stock-data';

const fact = (
  start: string,
  end: string,
  val: number,
  filed = '2026-08-01',
) => ({ start, end, val, filed, accn: `test-${end}`, form: '10-Q' });
const companyFacts = (facts: unknown[]) => ({
  cik: 123,
  facts: { 'us-gaap': { Revenues: { units: { USD: facts } } } },
});

test('SEC TTM uses annual plus current YTD minus prior YTD and amended comparatives', () => {
  const input = companyFacts([
    fact('2024-01-01', '2024-12-31', 80),
    fact('2025-01-01', '2025-12-31', 100),
    fact('2025-01-01', '2025-06-30', 40, '2025-08-01'),
    fact('2025-01-01', '2025-06-30', 45),
    fact('2026-01-01', '2026-06-30', 60),
    fact('2026-04-01', '2026-06-30', 32),
    fact('2024-01-01', '2024-06-30', 30),
  ]);
  const before = JSON.stringify(input);
  const metrics = normalizeSec(input, 123, '2026-09-28');
  assert.equal(metrics.revenue?.value, 115);
  assert.equal(metrics.revenue?.period, 'TTM through 2026-06-30');
  assert.equal(metrics.revenueGrowth?.value, (115 / 95 - 1) * 100);
  assert.equal(JSON.stringify(input), before);
  assert.throws(
    () => normalizeSec(input, 999, '2026-09-28'),
    /Wrong SEC entity/,
  );
});

test('incomplete newer SEC periods remain missing, not stale annual substitutes', () => {
  const metrics = normalizeSec(
    companyFacts([
      fact('2025-01-01', '2025-12-31', 100),
      fact('2026-01-01', '2026-06-30', 60),
    ]),
    123,
    '2026-09-28',
  );
  assert.equal(metrics.revenue, undefined);
});

test('earnings screens distinguish losses, zero, unknown and private records', () => {
  const observation = (value: number) => ({
    value,
    period: 'TTM',
    source: 'Test',
    url: 'https://example.com',
  });
  const context: StockContext = {
    status: 'partial',
    fetchedAt: null,
    metrics: { netIncome: observation(-5), trailingPe: observation(70) },
  };
  assert.equal(metricText('trailingPe', context), 'N/M');
  assert.equal(matchesScreen(context, 'high'), true);
  assert.equal(matchesScreen(context, '50'), false);
  assert.equal(
    matchesScreen(
      { ...context, metrics: { netIncome: observation(0) } },
      'loss',
    ),
    true,
  );
  assert.equal(matchesScreen({ ...context, metrics: {} }, 'high'), false);
  assert.equal(matchesScreen({ ...context, status: 'private' }, 'high'), false);
  assert.equal(metricText('price', { ...context, metrics: {} }), 'Unavailable');
});

test('timeline preserves partial dates and missing recording dates', () => {
  const lineages = getStockLedger('tesla')!.lineages;
  const points = timelinePoints(lineages, 'occurred');
  assert.equal(points.length, lineages.flatMap((l) => l.events).length);
  const noRecording = lineages.map((l) => ({
    ...l,
    events: l.events.map((e) => ({ ...e, recordedAt: undefined })),
  }));
  assert.deepEqual(timelinePoints(noRecording, 'recorded'), []);
  assert.equal(
    new Date(dateRange('2024-02')![1]).toISOString(),
    '2024-02-29T23:59:59.999Z',
  );
  assert.equal(dateRange('2024-02-30'), null);
});

test('backdated corrections follow capture order and unknown states never become delivery', () => {
  const original = getStockLedger('tesla')!.lineages[0];
  const assessment = original.events.find((e) => e.kind === 'assessment')!;
  const lineage: StockLineage = {
    ...original,
    events: [
      { ...assessment, state: 'fulfilled', recordedAt: '2026-09-27' },
      {
        ...assessment,
        id: 'correction',
        state: 'open',
        occurredOn: '2020-01-01',
        recordedAt: '2026-09-28',
      },
    ],
  };
  assert.equal(lineageState(lineage), 'open');
  assert.equal(
    lineageState({
      ...lineage,
      events: [{ ...assessment, state: 'unexpected' as never }],
    }),
    'unknown',
  );
});

test('provider overviews reject wrong entities and unavailable multiples', () => {
  const payload = {
    Symbol: 'TSLA',
    LatestQuarter: '2026-06-30',
    PERatio: 'None',
    ForwardPE: '0',
    RevenueTTM: '100',
    DilutedEPSTTM: '-2',
  };
  assert.deepEqual(normalizeOverview(payload, 'NVDA'), {});
  const metrics = normalizeOverview(payload, 'TSLA');
  assert.equal(metrics.trailingPe, undefined);
  assert.equal(metrics.forwardPe, undefined);
  assert.equal(metrics.eps?.value, -2);
});

test('SEC growth compares adjacent fiscal years with different week-ending dates', () => {
  const input = companyFacts([
    fact('2023-01-30', '2024-01-28', 80),
    fact('2024-01-29', '2025-01-26', 100),
    fact('2025-01-27', '2026-01-25', 150),
    fact('2024-01-29', '2024-07-28', 40),
    fact('2025-01-27', '2025-07-27', 60),
    fact('2026-01-26', '2026-07-26', 90),
  ]);
  const metrics = normalizeSec(input, 123, '2026-09-28');
  assert.equal(metrics.revenue?.value, 180);
  assert.equal(metrics.revenueGrowth?.value, 50);
});
