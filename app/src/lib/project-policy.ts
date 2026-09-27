/** Alex's documented product decision; never inferred from age, price or evidence. */
export const PROJECT_POLICY_VERSION = 'bitcoin-genesis-v1';
export function projectFlags(slug: string): { genesis: boolean } {
  return { genesis: slug === 'btc' };
}
