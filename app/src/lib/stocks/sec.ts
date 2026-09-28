import { finite, type Observation, type StockContext } from './context';

type Fact = {
  start?: string;
  end: string;
  val: number;
  filed: string;
  accn: string;
  form: string;
};
type CompanyFacts = {
  cik: number;
  facts: { 'us-gaap'?: Record<string, { units: Record<string, Fact[]> }> };
};
const day = (s: string) => Date.parse(`${s}T00:00:00Z`) / 86400000;
const TAGS = {
  revenue: [
    'RevenueFromContractWithCustomerExcludingAssessedTax',
    'Revenues',
    'SalesRevenueNet',
    'RevenueFromContractWithCustomerIncludingAssessedTax',
  ],
  netIncome: ['NetIncomeLoss', 'ProfitLoss'],
  operating: ['NetCashProvidedByUsedInOperatingActivities'],
  capex: ['PaymentsToAcquirePropertyPlantAndEquipment'],
  cash: ['CashAndCashEquivalentsAtCarryingValue'],
} as const;

/** De-duplicate restatements within each exact period, keeping the latest filing. */
function facts(
  input: CompanyFacts,
  tags: readonly string[],
  asOf: string,
): Fact[] {
  const map = new Map<string, Fact>();
  for (const tag of tags)
    for (const fact of input.facts?.['us-gaap']?.[tag]?.units?.USD ?? []) {
      if (
        !['10-K', '10-Q', '10-K/A', '10-Q/A'].includes(fact.form) ||
        fact.end > asOf ||
        fact.filed > asOf ||
        !Number.isFinite(day(fact.end)) ||
        finite(fact.val) == null
      )
        continue;
      const key = `${fact.start ?? ''}/${fact.end}`;
      const prior = map.get(key);
      if (!prior || fact.filed > prior.filed)
        map.set(key, { ...fact, val: Number(fact.val) });
    }
  return [...map.values()];
}
function ttm(
  values: Fact[],
  asOf: string,
): { value: number; end: string; legs: Fact[] } | null {
  const annual = values
    .filter(
      (f) =>
        f.start &&
        day(f.end) - day(f.start) >= 330 &&
        day(f.end) - day(f.start) <= 380 &&
        f.end <= asOf,
    )
    .sort((a, b) => b.end.localeCompare(a.end))[0];
  if (!annual) return null;
  const current = values
    .filter(
      (f) =>
        f.start &&
        day(f.start) - day(annual.end) > 0 &&
        day(f.start) - day(annual.end) <= 7 &&
        f.end <= asOf &&
        f.end > annual.end,
    )
    .sort((a, b) => b.end.localeCompare(a.end))[0];
  if (!current) return { value: annual.val, end: annual.end, legs: [annual] };
  const prior = values
    .filter(
      (f) =>
        f.start &&
        Math.abs(day(current.start!) - day(f.start) - 365) <= 7 &&
        Math.abs(day(current.end) - day(f.end) - 365) <= 7,
    )
    .sort((a, b) => b.filed.localeCompare(a.filed))[0];
  if (!prior) return null; // Never substitute an annual period for an incomplete newer TTM.
  return {
    value: annual.val + current.val - prior.val,
    end: current.end,
    legs: [annual, current, prior],
  };
}
export function normalizeSec(
  input: unknown,
  cik: number,
  asOf: string,
): StockContext['metrics'] {
  const data = input as CompanyFacts;
  if (!data || Number(data.cik) !== cik || !data.facts)
    throw Error('Wrong SEC entity');
  const url = `https://www.sec.gov/edgar/browse/?CIK=${cik}&owner=exclude`;
  const metrics: StockContext['metrics'] = {};
  const flows: Record<string, ReturnType<typeof ttm>> = {};
  for (const key of ['revenue', 'netIncome', 'operating', 'capex'] as const)
    flows[key] = ttm(facts(data, TAGS[key], asOf), asOf);
  const end = flows.revenue?.end;
  const observed = (
    flow: NonNullable<ReturnType<typeof ttm>>,
  ): Observation => ({
    value: flow.value,
    period: `TTM through ${flow.end}`,
    source: 'SEC EDGAR',
    url,
    note:
      flow.legs.length === 1
        ? 'Reported annual total.'
        : `Annual + current year to date - prior year to date. Filings: ${flow.legs.map((f) => f.accn).join(', ')}.`,
  });
  for (const key of ['revenue', 'netIncome'] as const)
    if (flows[key] && flows[key]!.end === end)
      metrics[key] = observed(flows[key]!);
  const operating = flows.operating,
    capex = flows.capex;
  if (operating && capex && operating.end === end && capex.end === end)
    metrics.freeCashFlow = {
      ...observed(operating),
      value: operating.value - capex.value,
      note: 'Derived: operating cash flow minus purchases of property, plant and equipment.',
    };
  if (end && flows.revenue) {
    // Fiscal quarters may end on different calendar dates in 52/53-week years.
    const priorCutoff = new Date((day(end) - 358) * 86400000)
      .toISOString()
      .slice(0, 10);
    const prior = ttm(facts(data, TAGS.revenue, asOf), priorCutoff);
    if (
      prior &&
      prior.value > 0 &&
      Math.abs(day(end) - day(prior.end) - 365) <= 7
    )
      metrics.revenueGrowth = {
        ...observed(flows.revenue),
        value: (flows.revenue.value / prior.value - 1) * 100,
        note: 'Year-over-year change in trailing revenue.',
      };
    const cash = facts(data, TAGS.cash, asOf)
      .filter((f) => !f.start && f.end === end)
      .sort((a, b) => b.filed.localeCompare(a.filed))[0];
    if (cash)
      metrics.cash = {
        value: cash.val,
        period: `At ${cash.end}`,
        source: 'SEC EDGAR',
        url,
      };
  }
  return metrics;
}
