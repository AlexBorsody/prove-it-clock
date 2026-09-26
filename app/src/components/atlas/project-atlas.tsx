import Link from 'next/link';
import { getPublishedAtlas } from '@/lib/atlas/data';
import { projectAtlas } from '@/lib/atlas/project';
import AtlasExplorer from './atlas-explorer';

export default async function ProjectAtlas({ slug, name }: { slug: string; name: string }) {
  let data;
  try {
    const published = await getPublishedAtlas();
    data = published ? projectAtlas(published, slug) : null;
  } catch {
    return <><h2>{name} Promise Atlas</h2><p role="alert">The promise ledger could not be loaded.</p><Link href={`/atlas?project=${slug}`}>Open the Atlas ↗</Link></>;
  }
  if (!data || !data.nodes.length) {
    return <><h2>{name} Promise Atlas</h2><p>{data?.coverage.unavailableProjects.length ? 'This project’s published assessment is unavailable.' : 'No scored promises for this project are in the current published ledger.'}</p></>;
  }
  return <AtlasExplorer key={slug} data={data} project={{ slug, name }} />;
}
