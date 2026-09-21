/**
 * events:check — validate the seed events in app/data/projects.json.
 *
 * Every event must have a real `date` (YYYY-MM-DD), a non-empty `title`,
 * and a non-empty `evidence_summary`. Each of the six v0.2.0-scored
 * projects needs at least five valid events.
 *
 * Runs against local seeds only — no Supabase, no keys, CI-safe.
 * Run: npx tsx scripts/events-check.ts  (npm run events:check)
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { SCORED_PROJECT_SLUGS } from "../src/lib/active-methodology";

const MIN_EVENTS = 5;

interface SeedEvent {
  date?: unknown;
  type?: unknown;
  title?: unknown;
  evidence_summary?: unknown;
}

interface SeedProject {
  slug?: unknown;
  events?: unknown;
}

function isValid(e: SeedEvent): boolean {
  return (
    typeof e.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(e.date) &&
    typeof e.title === "string" &&
    e.title.trim().length > 0 &&
    typeof e.evidence_summary === "string" &&
    e.evidence_summary.trim().length > 0
  );
}

function main(): void {
  const path = join(dirname(__dirname), "data", "projects.json");
  const doc = JSON.parse(readFileSync(path, "utf8")) as { projects?: unknown };
  const projects = Array.isArray(doc.projects) ? (doc.projects as SeedProject[]) : [];

  let failed = false;
  for (const p of projects) {
    const slug = String(p.slug ?? "?");
    const events = Array.isArray(p.events) ? (p.events as SeedEvent[]) : [];
    const valid = events.filter(isValid);
    const scored = (SCORED_PROJECT_SLUGS as readonly string[]).includes(slug);
    const need = scored ? MIN_EVENTS : 0;
    const ok = valid.length >= need;
    if (scored) {
      console.log(`${ok ? "PASS" : "FAIL"} ${slug}: ${valid.length}/${events.length} valid events (need ${need})`);
      if (!ok) failed = true;
    } else if (valid.length < events.length) {
      console.log(`WARN ${slug}: ${events.length - valid.length} invalid event(s) — not a scored project, not failing`);
    }
  }
  if (!failed) console.log("events:check: all scored projects have >= 5 valid events");
  process.exit(failed ? 1 : 0);
}

main();
