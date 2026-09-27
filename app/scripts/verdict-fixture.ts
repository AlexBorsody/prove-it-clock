/** Fictional test records only. Never publish this fixture. */
import { IMPORTANCE_VERSION, IMPORTANCE_WEIGHTS, VERDICT_METHODOLOGY, VERDICT_POLICY,
  type ReviewedPromise, type VerdictPublication, type DeliveryOutcome } from '../src/lib/promise-assessment';
import { TAXONOMY_VERSION } from '../data/atlas-taxonomy';
export const fixtureSource = {url:'https://example.org/fictional',summary:'Fictional test evidence',locator:'Test paragraph',published_at:'2026-09-01T00:00:00Z'};
export function reviewedPromise(lineage:string,outcome:DeliveryOutcome,core=false):ReviewedPromise {
  const tier=core?'core':'supporting';
  return {lineage,claim_type:'ongoing',core,claim_text:`Fictional ${lineage} obligation`,attribution:'issuer',criteria:'Observable fictional condition',
    state:outcome==='kept'?'fulfilled':outcome==='pending'?'open':outcome==='unknown'?'unknown':'lapsed',outcome,lifecycle:'current',unkept_reason:outcome==='unkept'?'lapsed':null,
    effective_at:'2026-09-01T00:00:00Z',assessed_at:'2026-09-26T19:00:00Z',observed_at:outcome==='kept'||outcome==='unkept'?'2026-09-26T18:00:00Z':null,
    evidence_valid_until:'2026-10-01T00:00:00Z',obligation_end_at:null,rationale:'Fixture only',author:'Test author',
    importance:{tier,weight:IMPORTANCE_WEIGHTS[tier],rationale:'Fictional importance',author:'Test author'},
    classification:{primary:'payments',rationale:'Fictional classification',author:'Test author'},
    admission:{obligation_id:lineage,rationale:'One distinct fictional obligation',author:'Test author'},
    claim_sources:[fixtureSource],outcome_evidence:outcome==='kept'||outcome==='unkept'?[fixtureSource]:[],deadline:null,transitions:[]};
}
export function verdictFixture(key='v4-fixture'):VerdictPublication {
  return {schema_version:4,run_key:key,as_of:'2026-09-26T20:00:00Z',methodology:VERDICT_METHODOLOGY,
    versions:{policy:VERDICT_POLICY,importance:IMPORTANCE_VERSION,taxonomy:TAXONOMY_VERSION,assignments:'fixture-assignments',admission:'fixture-admission'},
    review_status:'published',reviewed_by:'Test reviewer',policy_ref:'Fictional verification only',projects:[{slug:'fixture-a',availability:'available',assessment:{
      capacity:2,allowance:0,allowance_rationale:'No allowance',rationale:'Fixture',research_scope:'Fictional test scope',
      promises:[reviewedPromise('core','pending',true),reviewedPromise('supporting','kept')]}}]};
}
