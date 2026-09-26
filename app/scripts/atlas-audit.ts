/** Read-only audit. Default: configured DB. --file: captured public API envelope. */
import { readFileSync, existsSync } from 'node:fs';
import { readPublishedPromiseLedger } from '../src/lib/heart-data';
import { adaptAtlas } from '../src/lib/atlas/adapter';
async function main() {
  if(existsSync('.env.local')) process.loadEnvFile('.env.local');
  const file=process.argv[2]==='--file'?process.argv[3]:undefined;
  const raw=file?JSON.parse(readFileSync(file,'utf8')):await readPublishedPromiseLedger();
  if(file&&raw.status!=='published') throw new Error('File must be a published public API response');
  const data=adaptAtlas(raw);
  if(!data) { console.log('No published run'); return; }
  const flags: Record<string,number>={}; const states: Record<string,number>={};
  for(const n of data.nodes) { states[n.originalState]=(states[n.originalState]??0)+1; for(const flag of n.qualityFlags) flags[flag]=(flags[flag]??0)+1; }
  console.log(JSON.stringify({source:file?'captured-public-api':'configured-database',run:data.dataRevision,methodology:data.methodologyVersion,asOf:data.asOf,
    projects:data.coverage.projects,promises:data.nodes.length,states,flags,
    unavailableProjects:data.coverage.unavailableProjects,layoutPending:data.coverage.layoutPending,
    unclassified:data.nodes.filter(n=>!n.primaryCategory).map(n=>({id:n.id,rationale:n.assignmentRationale}))},null,2));
}
main().catch(()=>{console.error('Atlas audit failed: check data access, identities and published record validity.');process.exitCode=1;});
