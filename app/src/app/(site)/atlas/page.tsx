import AtlasExplorer from '@/components/atlas/atlas-explorer';
import { readPublishedPromiseLedger } from '@/lib/heart-data';
import { adaptAtlas } from '@/lib/atlas/adapter';
import Link from 'next/link';
export const dynamic = 'force-dynamic';
export const metadata = { title:'Promise Atlas | Prove Value', description:'Explore the published promise ledger by subject, outcome and evidence.' };
export default async function AtlasPage() {
  let data;
  try { data=adaptAtlas(await readPublishedPromiseLedger()); }
  catch { return <section className="panel"><h1>Promise Atlas</h1><p role="alert">The promise ledger could not be loaded.</p><p><Link href="/atlas">Try again</Link></p></section>; }
  if(!data) return <section className="panel"><h1>Promise Atlas</h1><p>No promise ledger is published for the active methodology yet.</p></section>;
  return <AtlasExplorer data={data}/>;
}
