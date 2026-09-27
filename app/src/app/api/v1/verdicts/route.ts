import { readPublishedPromiseLedger } from '@/lib/heart-data';
import { adaptAtlas } from '@/lib/atlas/adapter';
import { parseVerdictQuery, revisionFor } from '@/lib/verdict-query';
import { summarizeDelivery } from '@/lib/promise-verdict';
import { deliveryOutcome, verdictReceipt } from '@/lib/delivery-calculation';
export const dynamic = 'force-dynamic';
export async function GET(request:Request) {
  let query;
  try {query=parseVerdictQuery(new URL(request.url).searchParams);} catch {return Response.json({error:'Invalid verdict query'},{status:400});}
  try {
    const ledger=await readPublishedPromiseLedger(query), data=adaptAtlas(ledger);
    if (!data) return Response.json({error:'Published run not found'},{status:404});
    const revision=revisionFor(data);
    const projects=(ledger.projects as Array<{slug:string;name:string;availability:string}>).filter(p => !query.slug || p.slug === query.slug).map(p => ({
      slug:p.slug,name:p.name,availability:p.availability,summary:summarizeDelivery(data,p.slug),receipt:verdictReceipt(p.slug,revision),
    }));
    if (!projects.length) return Response.json({error:'Project not in published run'},{status:404});
    const records=data.nodes.filter(n => (!query.slug || n.projectSlug === query.slug) && (!query.category || (n.primaryCategory ?? 'unclassified') === query.category) &&
      (!query.group || deliveryOutcome(n) === query.group) && (!query.promise || n.id === query.promise)).map(n => ({
      id:n.id,project:n.projectSlug,lineage:n.lineageId,claim:n.claimText,claim_text_kind:n.claimTextKind,
      state:n.state,original_state:n.originalState,core:n.core,category:n.primaryCategory ?? 'unclassified',
      outcome:deliveryOutcome(n),importance:n.reviewed?.importance ?? null,lifecycle:n.reviewed?.lifecycle ?? null,
      assessed_at:n.assessedAt,claim_sources:n.claimSources,outcome_evidence:n.outcomeEvidence,evidence_roles_separated:n.evidenceRolesSeparated,
      fulfillment_test:n.fulfillmentTest,rationale:n.assessmentExplanation,quality_flags:n.qualityFlags,
      receipt:verdictReceipt(n.projectSlug,revision,{promise:n.id}),
    }));
    return Response.json({run:data.dataRevision,as_of:data.asOf,methodology:data.methodologyVersion,versions:data.verdictVersions ?? null,
      assignment_version:data.assignmentVersion,scope:{category:query.category ?? null,group:query.group ?? null,promise:query.promise ?? null},
      projects,records},{headers:{'Cache-Control':'no-store'}});
  } catch {return Response.json({error:'Published verdict ledger unavailable'},{status:503});}
}
