import { CATEGORIES, type CategoryId } from '../../data/atlas-taxonomy';
import { DELIVERY_GROUPS, type ReceiptRevision } from './delivery-calculation';
import { VERDICT_METHODOLOGY, type DeliveryOutcome } from './promise-assessment';
import { HEARTS_METHODOLOGY, LEGACY_HEARTS_METHODOLOGY } from './heart-data';
export interface VerdictQuery {runId?:string;methodology:string;assignmentVersion?:string;slug?:string;category?:CategoryId;group?:DeliveryOutcome;promise?:string}
/** Reject invalid scope instead of silently broadening the receipt denominator. */
export function parseVerdictQuery(params: URLSearchParams): VerdictQuery {
  for (const key of ['run','methodology','assignments','project','category','group','promise']) {
    if (params.getAll(key).length > 1) throw new Error(`Repeated ${key}`);
    if (params.has(key) && !params.get(key)?.trim()) throw new Error(`Empty ${key}`);
  }
  const runId = params.get('run') ?? undefined;
  if (runId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(runId)) throw new Error('Invalid published run');
  const methodology = params.get('methodology') ?? HEARTS_METHODOLOGY;
  if (![LEGACY_HEARTS_METHODOLOGY,VERDICT_METHODOLOGY].includes(methodology)) throw new Error('Unsupported methodology');
  const assignmentVersion = params.get('assignments') ?? undefined;
  if (assignmentVersion && assignmentVersion.length > 200) throw new Error('Invalid assignment version');
  const slug = params.get('project') ?? undefined;
  if (slug && !/^[a-z0-9-]{1,100}$/.test(slug)) throw new Error('Invalid project');
  const category = params.get('category') ?? undefined, group = params.get('group') ?? undefined;
  if (category && !CATEGORIES.some(c => c.id === category)) throw new Error('Invalid category');
  if (group && !(DELIVERY_GROUPS as readonly string[]).includes(group)) throw new Error('Invalid outcome group');
  const promise = params.get('promise') ?? undefined;
  if (promise && promise.length > 1000) throw new Error('Invalid promise');
  return {runId,methodology,assignmentVersion,slug,category:category as CategoryId|undefined,group:group as DeliveryOutcome|undefined,promise};
}
export const revisionFor = (data: {dataRevision:string;methodologyVersion:string;assignmentVersion:string}): ReceiptRevision => ({runId:data.dataRevision,methodology:data.methodologyVersion,assignments:data.assignmentVersion});
