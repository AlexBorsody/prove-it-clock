/** Targeted small-cap intake: named CoinGecko IDs outside the top-100 universe. Draft research candidates, never ratings. */
import { fileURLToPath } from 'node:url';
import { collectTargetedIntake } from '../src/pipeline/promise-intake';
import { fetchMarketsByIds } from '../src/providers/coingecko/index.js';

// Small-cap merit set (Alex 2026-09-27): substantive projects ~$150-200M mcap
// plus FARTCOIN as the meme-coin foil. BAT is already an onboarded project.
export const TARGETED_COINGECKO_IDS = ['origintrail', 'neo', 'fartcoin'];

async function main() {
  const result = await collectTargetedIntake({
    directory: fileURLToPath(new URL('../../db/research/intake/', import.meta.url)),
    ids: TARGETED_COINGECKO_IDS,
    fetchMarketsByIds,
  });
  const mapped = result.snapshot.candidates.filter(c => c.existingProjectSlug).length;
  console.log(JSON.stringify({
    artifact: result.path, reused: result.reused, capturedAt: result.snapshot.capturedAt,
    requestedIds: result.snapshot.requestedIds, coverage: result.snapshot.coverage,
    candidates: result.snapshot.candidates.map(c => ({ symbol: c.symbol, name: c.name, rank: c.marketCapRank, stage: c.stage })),
    existingMappings: mapped, needsIdentityReview: result.snapshot.candidates.length - mapped,
    publication: 'none',
  }, null, 2));
}

main().catch(error => {
  console.error(`Targeted intake failed: ${error instanceof Error ? error.message : 'unknown error'}`);
  process.exitCode = 1;
});
