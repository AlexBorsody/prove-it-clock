export function CodeRowSkeleton({ name }: { name?: string }) {
  return <article className="code-row-placeholder" aria-busy="true" aria-label={name ? `Loading ${name} CODE data` : 'Loading CODE data'}>
    {name && <strong>{name}</strong>}
    <div className="skeleton" style={{ height: 22, width: '55%', marginBottom: 18 }} aria-hidden="true" />
    <div className="skeleton" style={{ height: 78 }} aria-hidden="true" />
  </article>;
}
export default function CodeSkeleton() {
  return <div className="panel"><p role="status">Loading CODE data…</p><div className="code-rows">{[0,1,2].map(i => <CodeRowSkeleton key={i}/>)}</div></div>;
}
