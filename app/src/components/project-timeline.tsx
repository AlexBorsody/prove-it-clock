import { readPromiseTimeline } from '@/lib/promise-timeline-data';
import { searchMeta } from '@/lib/search-sections';
import PromiseTimeline from './promise-timeline';

export default async function ProjectTimeline({slug,name,revisionId}:{slug:string;name:string;revisionId?:string}) {
  const result=await readPromiseTimeline(slug,revisionId);
  return <section className="panel search-section" {...searchMeta({id:`project-${slug}-timeline`,title:`${name} promise timeline`,kind:'Evidence',project:slug,keywords:'claims mentions evidence assessments history'})}>
    <h2 title="What changed, when, and the sources behind it.">Promise timeline</h2>
    {result.status==='available' ? <PromiseTimeline key={result.data.revisionId} data={result.data}/> :
      result.status==='empty' ? <p>No dated promise events have been published yet. The current assessment remains in the promise record above.</p> :
      <p role="status">The promise history could not be loaded. This does not mean no events occurred.</p>}
  </section>;
}
