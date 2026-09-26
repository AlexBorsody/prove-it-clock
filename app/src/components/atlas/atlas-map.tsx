'use client';
import { useEffect, useRef, useState } from 'react';
import type { AtlasDataset, AtlasNode } from '@/lib/atlas/types';
import { STATE_LABELS } from '@/lib/atlas/types';
import { fitCamera, zoomCamera, type Camera, type Point } from '@/lib/atlas/camera';
import styles from './atlas.module.css';
import { CATEGORIES } from '../../../data/atlas-taxonomy';
export default function AtlasMap({ data, matches, selected, select }: { data:AtlasDataset; matches:AtlasNode[]; selected:string|null; select:(id:string|null)=>void }) {
  const box=useRef<HTMLDivElement>(null), svg=useRef<SVGSVGElement>(null);
  const [size,setSize]=useState({width:800,height:600});
  const allBounds=data.regions.flatMap(r=>[{x:r.x,y:r.y},{x:r.x+r.width,y:r.y+r.height}]);
  const [camera,setCamera]=useState<Camera>(()=>fitCamera(allBounds,800/600,20));
  const pointers=useRef(new Map<number,Point>());
  const gesture=useRef({distance:0,moved:false,id:null as string|null,origin:{x:0,y:0}});
  const [hovered,setHovered]=useState<string|null>(null);
  const lastSelection=useRef<string|null>(null);
  const measured=useRef(false);
  const [dragging,setDragging]=useState(false);
  const aspect=size.width/size.height, ids=new Set(matches.map(n=>n.id));
  const positions=new Map(data.positions.map(p=>[p.nodeId,p]));
  const nodesById=new Map(data.nodes.map(n=>[n.id,n]));
  const reset=()=>setCamera(fitCamera(allBounds,aspect,20));
  useEffect(()=>{
    if(!box.current) return;
    const observer=new ResizeObserver(([entry])=>{
      const next={width:entry.contentRect.width,height:entry.contentRect.height};
      setSize(next);
      if(!measured.current) {
        measured.current=true;
        const point=data.positions.find(p=>p.nodeId===selected);
        setCamera(fitCamera(point?[point]:allBounds,next.width/next.height,point?160:20));
      }
    });
    observer.observe(box.current); return ()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    setCamera(c=>({...c,height:c.width/aspect}));
  },[aspect]);
  useEffect(()=>{
    if(selected && selected!==lastSelection.current) {
      const point=data.positions.find(p=>p.nodeId===selected);
      const firstSelection = !lastSelection.current;
      if(point) setCamera(c=>{
        // A direct link or a list selection brings the selected node into view.
        if(firstSelection || point.x<c.x || point.x>c.x+c.width || point.y<c.y || point.y>c.y+c.height) return fitCamera([point],aspect,160);
        return c;
      });
    }
    lastSelection.current=selected;
  },[selected,aspect,data.positions]);
  const relative=(point:Point)=>{const rect=svg.current!.getBoundingClientRect();return {x:(point.x-rect.left)/rect.width,y:(point.y-rect.top)/rect.height};};
  const zoom=(factor:number)=>setCamera(c=>zoomCamera(c,factor));
  const preview=hovered?nodesById.get(hovered):null;
  const unit=camera.width/size.width;
  const labelSize=Math.max(14,12*unit);
  const compactLabels=unit>1.6;
  const dotRadius=Math.max(7,3*unit);
  return <div className={styles.mapFrame}>
    <div className={styles.mapTools} aria-label="Map controls">
      <div><button type="button" aria-label="Zoom in" onClick={()=>zoom(0.7)}>+</button><button type="button" aria-label="Zoom out" onClick={()=>zoom(1.4)}>−</button></div>
      <button type="button" onClick={reset}>Reset view</button>
      <button type="button" disabled={!matches.length} onClick={()=>setCamera(fitCamera(matches.map(n=>positions.get(n.id)!),aspect))}>Fit results</button>
    </div>
    <div className={styles.mapViewport} ref={box}>
      <svg ref={svg} viewBox={`${camera.x} ${camera.y} ${camera.width} ${camera.height}`} className={dragging?styles.dragging:undefined}
        role="group" aria-label="Promise category map. Use the list below for keyboard selection." tabIndex={0}
        onKeyDown={event=>{
          const step=camera.width/8;
          if(event.key==='Escape') {select(null);return;}
          if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','=','Home'].includes(event.key)) {
            event.preventDefault();
            if(event.key==='Home') reset();
            else if(event.key==='+'||event.key==='=') zoom(0.7);
            else if(event.key==='-') zoom(1.4);
            else setCamera(c=>({...c,x:c.x+(event.key==='ArrowLeft'?-step:event.key==='ArrowRight'?step:0),y:c.y+(event.key==='ArrowUp'?-step:event.key==='ArrowDown'?step:0)}));
          }
        }}
        onPointerDown={event=>{
          if(event.button!==0) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});
          setDragging(true); setHovered(null);
          if(pointers.current.size===1) gesture.current={distance:0,moved:false,id:(event.target as Element).closest('[data-node-id]')?.getAttribute('data-node-id')??null,origin:{x:event.clientX,y:event.clientY}};
          else {const [a,b]=[...pointers.current.values()];gesture.current.distance=Math.hypot(a.x-b.x,a.y-b.y);gesture.current.moved=true;}
        }}
        onPointerMove={event=>{
          const previous=pointers.current.get(event.pointerId);
          if(!previous) { if(event.pointerType==='mouse') setHovered((event.target as Element).closest('[data-node-id]')?.getAttribute('data-node-id')??null); return; }
          const point={x:event.clientX,y:event.clientY};
          const oldPoints=[...pointers.current.values()];
          pointers.current.set(event.pointerId,point);
          if(Math.hypot(point.x-gesture.current.origin.x,point.y-gesture.current.origin.y)>6) gesture.current.moved=true;
          if(pointers.current.size>1) {
            const [a,b]=[...pointers.current.values()]; const distance=Math.hypot(a.x-b.x,a.y-b.y);
            const center={x:(a.x+b.x)/2,y:(a.y+b.y)/2}; const oldCenter={x:(oldPoints[0].x+oldPoints[1].x)/2,y:(oldPoints[0].y+oldPoints[1].y)/2};
            const ratio=gesture.current.distance>0&&distance>0?gesture.current.distance/distance:1;
            const focal=relative(center);
            setCamera(c=>{const next=zoomCamera(c,ratio,focal);return {...next,x:next.x-(center.x-oldCenter.x)*next.width/size.width,y:next.y-(center.y-oldCenter.y)*next.height/size.height};});
            gesture.current.distance=distance;
          } else if(gesture.current.moved) setCamera(c=>({...c,x:c.x-(point.x-previous.x)*c.width/size.width,y:c.y-(point.y-previous.y)*c.height/size.height}));
        }}
        onPointerUp={event=>{
          pointers.current.delete(event.pointerId);
          if(!pointers.current.size) {setDragging(false);if(!gesture.current.moved) select(gesture.current.id);}
          if(event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={event=>{pointers.current.delete(event.pointerId);gesture.current.moved=true;setDragging(false);}}
        onPointerLeave={()=>setHovered(null)}>
        {data.regions.map(r=><g key={`${r.id}-${r.x}`} className={styles.region}>
          <rect x={r.x} y={r.y} width={r.width} height={r.height} rx={18}/>
          <text style={{fontSize:labelSize}} x={r.x+24} y={r.y+32}>{compactLabels?(CATEGORIES.find(c=>c.id===r.id)?.short??r.label):r.label}</text>
          {!compactLabels&&<text style={{fontSize:Math.max(11,10*unit)}} className={styles.regionCount} x={r.x+24} y={r.y+58}>{data.nodes.filter(n=>(n.primaryCategory??'unclassified')===r.id).length} primary assignments</text>}
        </g>)}
        {data.nodes.map(node=>{
          const p=positions.get(node.id)!; if(!ids.has(node.id)) return null;
          const isSelected=selected===node.id;
          return <g key={node.id} data-node-id={node.id} className={styles.node} data-state={node.state} aria-label={`${node.symbol}: ${STATE_LABELS[node.state]}. ${node.claimText}`}>
            <title>{`${node.symbol} · ${STATE_LABELS[node.state]}${node.core?' · Core':''}\n${node.claimText}`}</title>
            <circle cx={p.x} cy={p.y} r={17} fill="transparent" stroke="none"/>
            {node.core&&<circle cx={p.x} cy={p.y} r={dotRadius+4} className={styles.coreRing}/>}
            {isSelected&&<circle cx={p.x} cy={p.y} r={dotRadius+8} className={styles.selectedRing}/>}
            <circle cx={p.x} cy={p.y} r={dotRadius} className={styles.dot}/>
            {camera.width<700&&<text x={p.x} y={p.y+26} textAnchor="middle">{node.symbol}</text>}
          </g>;
        })}
      </svg>
      {preview&&<div className={styles.preview} role="tooltip"><strong>{preview.symbol} · {STATE_LABELS[preview.state]}{preview.core?' · Core':''}</strong><p>{preview.claimText}</p></div>}
      {!matches.length&&<p className={styles.mapEmpty}>No promises match these filters.</p>}
    </div>
    <p className={styles.gestureHint}>Drag to pan · Pinch or use + / − to zoom · Arrow keys move the map</p>
  </div>;
}
