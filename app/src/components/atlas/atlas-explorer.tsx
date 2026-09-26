'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CATEGORIES, categoryLabel } from '../../../data/atlas-taxonomy';
import { ATLAS_STATES, STATE_LABELS, type AtlasDataset } from '@/lib/atlas/types';
import { atlasQuery, EMPTY_FILTERS, matchesAtlas, parseAtlasQuery, revealSelection, type AtlasFilters } from '@/lib/atlas/filters';
import { searchMeta } from '@/lib/search-sections';
import AtlasMap from './atlas-map';
import AtlasDetails from './atlas-details';
import styles from './atlas.module.css';
export default function AtlasExplorer({ data, project }: { data:AtlasDataset; project?: { slug:string; name:string } }) {
  const params=useSearchParams(); const query=params.toString();
  const [localFilters,setLocalFilters]=useState<AtlasFilters>(EMPTY_FILTERS);
  const resolved=useMemo(()=>revealSelection(project?localFilters:parseAtlasQuery(new URLSearchParams(query),data.nodes),data.nodes),[project,localFilters,query,data.nodes]);
  const filters=resolved.filters;
  const prefix=project?`project-${project.slug}-atlas`:'atlas';
  const listId=`${prefix}-list-toggle`, detailId=`${prefix}-detail-title`;
  const matches=useMemo(()=>data.nodes.filter(n=>matchesAtlas(n,filters)),[data.nodes,filters]);
  const selected=data.nodes.find(n=>n.id===filters.promise);
  const [notice,setNotice]=useState('');
  const panel=useRef<HTMLElement>(null), lastFocus=useRef<HTMLElement|null>(null);
  const focusNext=useRef(false);
  const update=(next:AtlasFilters,replace=false)=>{
    if(project) {setLocalFilters(next);return;}
    const q=atlasQuery(next);window.history[replace?'replaceState':'pushState'](null,'',`/atlas${q?'?'+q:''}`);
  };
  useEffect(()=>{
    if(resolved.cleared) {setNotice('Filters cleared to reveal the linked promise.');update(resolved.filters,true);}
  },[resolved]);
  useEffect(()=>{
    if(selected&&focusNext.current) {panel.current?.focus({preventScroll:true});panel.current?.scrollIntoView({block:'nearest',behavior:'auto'});focusNext.current=false;}
  },[selected]);
  function choose(id:string|null) {
    if(id) {lastFocus.current=document.activeElement instanceof HTMLElement?document.activeElement:null;focusNext.current=true;}
    update({...filters,promise:id});
    if(!id) requestAnimationFrame(()=>{ if(lastFocus.current?.isConnected) lastFocus.current.focus({preventScroll:true});else document.getElementById(listId)?.focus({preventScroll:true}); });
  }
  function filter(change:Partial<AtlasFilters>,replace=false) {setNotice('');update({...filters,...change,promise:null},replace);}
  const projectOptions=[...new Map(data.nodes.map(n=>[n.projectSlug,{slug:n.projectSlug,name:n.projectName,symbol:n.symbol}])).values()];
  const missingSources=data.nodes.filter(n=>!n.claimSources.length).length;
  const fullAtlasHref=`/atlas?${atlasQuery({...filters,projects:project?[project.slug]:filters.projects})}`;
  const categories=project?CATEGORIES.filter(c=>data.nodes.some(n=>(n.primaryCategory??'unclassified')===c.id||n.secondaryCategories.includes(c.id))):CATEGORIES;
  return <div className={`${styles.atlas}${project?' '+styles.embedded:''}`}>
    <header className={styles.header} {...searchMeta({id:`${prefix}-overview`,title:project?`${project.name} Promise Atlas`:'Promise Atlas',kind:'Atlas',project:project?.slug,keywords:'promise evidence categories subject map'})}>
      {project?<><h2>{project.name} Promise Atlas</h2><p>Explore {project.name}’s promises by subject. Select a point to see the evidence.</p><Link href={fullAtlasHref} className={styles.fullAtlas}>Open full Atlas ↗</Link></>:<><span className={styles.eyebrow}>PROVE VALUE / THE PROMISE LEDGER</span>
      <h1>Promise Atlas</h1><p>Explore what projects promised and what happened. Each point is a sourced promise, grouped by subject.</p></>}
    </header>
    <div className={styles.filters} aria-label="Filter promises">
      {!project&&<details className={styles.projects}><summary>Projects <span>{filters.projects.length?filters.projects.length:'All'}</span></summary><div className={styles.projectOptions}>{projectOptions.map(p=><label key={p.slug}><input type="checkbox" checked={filters.projects.includes(p.slug)} onChange={()=>filter({projects:filters.projects.includes(p.slug)?filters.projects.filter(s=>s!==p.slug):[...filters.projects,p.slug]})}/>{p.name} <small>{p.symbol}</small></label>)}</div></details>}
      <label>Category<select value={filters.category} onChange={e=>filter({category:e.target.value as AtlasFilters['category']})}><option value="">All subjects</option>{categories.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
      <label>Status<select value={filters.states.length===1?filters.states[0]:''} onChange={e=>filter({states:e.target.value?[e.target.value as AtlasFilters['states'][number]]:[]})}><option value="">{filters.states.length>1?'Multiple statuses':'All outcomes'}</option>{ATLAS_STATES.map(state=><option key={state} value={state}>{STATE_LABELS[state]}</option>)}</select></label>
      <label className={styles.search}>Search promises<input type="search" value={filters.q} maxLength={160} placeholder="Claim, project or ticker" onChange={e=>filter({q:e.target.value},true)}/></label>
    </div>
    <div className={styles.resultBar}><span role="status">{matches.length} of {data.nodes.length} promises</span><button type="button" onClick={()=>filter({...EMPTY_FILTERS,primaryOnly:false})}>Reset filters</button><a href={`#${listId}`}>Browse as a list ↓</a></div>
    {filters.primaryOnly&&filters.category&&<p className={styles.notice}>Showing primary category assignments to match the verdict total. <button type="button" onClick={()=>filter({primaryOnly:false})}>Include secondary associations</button></p>}
    {notice&&<p role="status" className={styles.notice}>{notice}</p>}
    {resolved.missing&&<p role="status" className={styles.warning}>That promise is not available in this published dataset. <button type="button" onClick={()=>choose(null)}>Clear selection</button></p>}
    {data.coverage.unavailableProjects.length>0&&<p className={styles.warning}>Assessments unavailable for: {data.coverage.unavailableProjects.join(', ')}. Missing assessments are not zero failures.</p>}
    <div className={`${styles.workspace}${selected?' '+styles.withSelection:''}`}>
      <AtlasMap data={data} matches={matches} selected={selected?.id??null} select={choose}/>
      {selected?<aside ref={panel} tabIndex={-1} className={styles.details} aria-labelledby={detailId} onKeyDown={e=>{if(e.key==='Escape')choose(null);}}><AtlasDetails node={selected} close={()=>choose(null)} titleId={detailId}/></aside>:!project&&<div className={styles.emptyDetails}><span aria-hidden="true">◎</span><h2>Start with a promise</h2><p>Select a point to inspect its claim, delivery test and evidence.</p><p className={styles.muted}>Different subjects. The same question: did they deliver?</p></div>}
    </div>
    <div className={styles.legend} aria-label="Map legend"><span><i data-state="kept"/> Kept</span><span><i data-state="lapsed"/> Lapsed / retired</span><span><i data-state="open"/> Open / in progress / unknown</span><span>◎ Core promise</span></div>
    <p className={styles.disclosure}>Curated category layout. Position shows classification, not measured similarity or importance.</p>
    <details className={styles.info}><summary>Layout, data and limitations</summary>
      <p>Categories are curated. Distance between points does not measure value or similarity. Uniform point sizes do not represent importance. Exact statuses and source limitations appear in each record.</p>
      <p>{missingSources} records lack a separately identified original claim source. Assessment references remain accessible. Initial category assignments are Codex-authored and have not been human-reviewed.</p>
      {data.coverage.layoutPending.length>0&&<p>{data.coverage.layoutPending.length} new records need a retained layout slot in the next manifest revision. They remain visible.</p>}
      <dl><dt>Ledger methodology</dt><dd>{data.methodologyVersion}</dd><dt>Data revision</dt><dd>{data.dataRevision}</dd><dt>Published as of</dt><dd>{data.asOf}</dd><dt>Taxonomy</dt><dd>{data.taxonomyVersion}</dd><dt>Assignments</dt><dd>{data.assignmentVersion}</dd><dt>Layout</dt><dd>{data.layoutVersion} · {data.positioningMethod}</dd></dl>
      <Link href="/methodology">Read the methodology ↗</Link>
    </details>
    <details className={styles.list}><summary id={listId}>Promise list <span>{matches.length} {matches.length===1?'match':'matches'}</span></summary>
      {!matches.length?<p>No promises match these filters.</p>:<ul>{matches.map(n=><li key={n.id} {...searchMeta({id:`${prefix}-promise-${encodeURIComponent(n.id)}`,title:`${n.projectName}: ${n.claimText}`,kind:'Promise',project:n.projectSlug,keywords:`${n.symbol} ${categoryLabel(n.primaryCategory)} ${STATE_LABELS[n.state]}`})}>
        <button type="button" className={styles.listSelect} onClick={()=>choose(n.id)} aria-pressed={selected?.id===n.id}>
          <span className={styles.listIdentity}>{n.symbol}{n.core?' · Core':''}<span className={styles.status} data-state={n.state}>{STATE_LABELS[n.state]}</span></span>
          <strong>{n.claimText}</strong><span className={styles.muted}>{categoryLabel(n.primaryCategory)}{filters.category&&filters.category!==(n.primaryCategory??'unclassified')?' · Secondary category match':''}</span>
        </button><Link href={n.promiseHref}>Full record ↗</Link>
      </li>)}</ul>}
    </details>
  </div>;
}
