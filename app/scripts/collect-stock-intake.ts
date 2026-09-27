/**
 * Stock claim intake: validates the curated company claim captures
 * (starting with the Tesla pilot seed) through the stock-intake pipeline
 * and writes an intake snapshot under db/research/stock-intake/.
 * Research records only; nothing here publishes to the ledger.
 */
import { fileURLToPath } from 'node:url';
import { collectStockIntake, loadJsonFile } from '../src/pipeline/stock-intake';

async function main() {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const seed = (await loadJsonFile(root + 'data/stocks/tesla-ledger.json')) as {
    companySlug: string;
    lineages: Array<{ id: string; claimCategory: string; tags: string[]; events: unknown[] }>;
  };
  const documents = seed.lineages.map((lineage) => ({
    schemaVersion: 1,
    kind: 'stock-claim-capture',
    companySlug: seed.companySlug,
    lineage: lineage.id,
    claimCategory: lineage.claimCategory,
    tags: lineage.tags,
    capturedAt: new Date().toISOString(),
    events: lineage.events,
  }));
  const result = await collectStockIntake({
    directory: fileURLToPath(new URL('../../db/research/stock-intake/', import.meta.url)),
    documents,
  });
  console.log(JSON.stringify({
    artifact: result.path,
    capturedAt: result.snapshot.capturedAt,
    payloadSha256: result.snapshot.payloadSha256,
    companies: result.snapshot.companies.length,
    validatedLineages: result.snapshot.validatedLineages,
    publication: 'none',
  }, null, 2));
}

main().catch((error) => {
  console.error(`Stock intake failed: ${error instanceof Error ? error.message : 'unknown error'}`);
  process.exitCode = 1;
});
