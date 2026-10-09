export const dynamic = "force-dynamic";
/** Temporary diagnostic: reports which token env names are set (booleans only, never values). */
export async function GET() {
  const names = ["GITHUB_TOKEN", "GH_TOKEN", "GITHUB_PAT", "GH_PAT"] as const;
  const seen: Record<string, boolean> = {};
  for (const n of names) seen[n] = Boolean(process.env[n]);
  return Response.json({ env: seen });
}
