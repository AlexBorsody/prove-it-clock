/**
 * events:check — every v0.2.0-scored project needs at least five valid events.
 *
 * A valid event has a real date, a type, and a non-empty title.
 * Run: npx tsx scripts/events-check.ts
 */
import { SCORED_PROJECT_SLUGS } from "../src/lib/active-methodology";

const MIN_EVENTS = 5;

const URL = process.env.SUPABASE_URL;
const KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY;

async function main() {
  if (!URL || !KEY) {
    console.error("events:check: SUPABASE_URL and a key are required");
    process.exit(2);
  }
  let failed = false;
  for (const slug of SCORED_PROJECT_SLUGS) {
    const projRes = await fetch(
      `${URL}/rest/v1/projects?select=id&slug=eq.${slug}`,
      { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } },
    );
    const projs = (await projRes.json()) as { id: string }[];
    if (!projs.length) {
      console.error(`FAIL ${slug}: project not found`);
      failed = true;
      continue;
    }
    const evRes = await fetch(
      `${URL}/rest/v1/project_events?select=event_date,event_type,title&project_id=eq.${projs[0].id}&order=event_date.asc`,
      { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } },
    );
    const events = (await evRes.json()) as {
      event_date: string | null;
      event_type: string | null;
      title: string | null;
    }[];
    const valid = events.filter(
      (e) => e.event_date && /^\d{4}-\d{2}-\d{2}$/.test(e.event_date) && e.event_type && e.title?.trim(),
    );
    const ok = valid.length >= MIN_EVENTS;
    console.log(`${ok ? "PASS" : "FAIL"} ${slug}: ${valid.length}/${events.length} valid events (need ${MIN_EVENTS})`);
    if (!ok) failed = true;
  }
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error("events:check error:", e);
  process.exit(2);
});
