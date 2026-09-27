import { CATEGORIES, type CategoryId } from '../../data/atlas-taxonomy';
import { DELIVERY_GROUPS, type ReceiptRevision } from './delivery-calculation';
import { VERDICT_METHODOLOGY, type DeliveryOutcome } from './promise-assessment';
import { HEARTS_METHODOLOGY } from './heart-data';
export interface VerdictQuery {runId?:string;methodology:string;slug?:string;category?:CategoryId;group?:DeliveryOutcome;promise?:string}
/** Reject invalid scope instead of silently broadening the receipt denominator. */
export function parseVerdictQuery(params: URLSearchParams): VerdictQuery {
  for (const key of ['run','methodology','project','category','group','promise']) if (params.getAll(key).length > 1) throw new Error(`Repeated ${key}`);
  const runId = params.get('run') ?? undefined;
  if (runId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(runId)) throw new Error('Invalid published run');
  const methodology = params.get('methodology') ?? HEARTS_METHODOLOGY;
  if (![HEARTS_METHODOLOGY,VERDICT_METHODOLOGY].includes(methodology)) throw new Error('Unsupported methodology');
  const slug = params.get('project') ?? undefined;
  if (slug && !/^[a-z0-9-]{1,100}$/.test(slug)) throw new Error('Invalid project');
  const category = params.get('category') ?? undefined, group = params.get('group') ?? undefined;
  if (category && !CATEGORIES.some(c => c.id === category)) throw new Error('Invalid category');
  if (group && !(DELIVERY_GROUPS as readonly string[]).includes(group)) throw new Error('Invalid outcome group');
  const promise = params.get('promise') ?? undefined;
  if (promise && promise.length > 1000) throw new Error('Invalid promise');
  return {runId,methodology,slug,category:category as CategoryId|undefined,group:group as DeliveryOutcome|undefined,promise};
}
export const revisionFor = (data: {dataRevision:string;methodologyVersion:string}): ReceiptRevision => ({runId:data.dataRevision,methodology:data.methodologyVersion});
