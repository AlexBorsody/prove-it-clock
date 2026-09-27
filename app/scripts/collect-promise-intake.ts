/** One batch, cached for 24 hours. Draft research candidates, never ratings. */
import { fileURLToPath } from 'node:url';
import { collectPromiseIntake, INTAKE_SIZE } from '../src/pipeline/promise-intake';
import { fetchUniverseMarkets } from '../src/providers/coingecko';

async function main() {
  const result = await collectPromiseIntake({
    directory: fileURLToPath(new URL('../../db/research/intake/', import.meta.url)),
    fetchMarkets: () => fetchUniverseMarkets(INTAKE_SIZE),
  });
  const mapped = result.snapshot.candidates.filter(c => c.existingProjectSlug).length;
  console.log(JSON.stringify({
    artifact: result.path, reused: result.reused, capturedAt: result.snapshot.capturedAt,
    coverage: result.snapshot.coverage, candidates: result.snapshot.candidates.length,
    existingMappings: mapped, needsIdentityReview: result.snapshot.candidates.length - mapped,
    publication: 'none',
  }, null, 2));
}

main().catch(error => {
  console.error(`Intake failed: ${error instanceof Error ? error.message : 'unknown error'}`);
  process.exitCode = 1;
});
