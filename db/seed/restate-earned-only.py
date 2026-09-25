#!/usr/bin/env python3
"""Restate heart runs earned-only: allowance -> 0, everything else untouched.
Originals are the immutable archive (stay published under the old methodology).
Restated runs publish under the new methodology string, so the site cuts over
cleanly with no duplicate points and no artificial cliff.
Usage: python3 restate-earned-only.py  (writes db/seed/heart-runs-earnedonly/)
"""
import json
import sys
from pathlib import Path

ROOT = Path("/home/hatch/workspace/proveit-top20-main")
SRC = ROOT / "db" / "seed" / "heart-runs"
DST = ROOT / "db" / "seed" / "heart-runs-earnedonly"

NEW_METHODOLOGY = "hearts claim-type rule v2 (adopted 2026-09-25; time decay removed; allowance removed 2026-09-25)"
ALLOWANCE_NOTE = (
    "Methodology update 2026-09-25: unearned allowance removed. "
    "Scores are earned promise hearts only. This change does not represent "
    "a change in project delivery. Original published scores remain available "
    "under the prior methodology as an immutable audit history."
)

# Skip superseded same-day variants with no local source; everything else mirrors.
SKIP = set()

def main() -> None:
    DST.mkdir(exist_ok=True)
    files = sorted(SRC.glob("*.json"))
    done = 0
    for src in files:
        if src.stem in SKIP:
            continue
        doc = json.loads(src.read_text())
        assert doc.get("schema_version") == 2, f"unexpected schema in {src.name}"
        old_key = doc["run_key"]
        doc["run_key"] = f"{old_key}-earnedonly"
        doc["methodology"] = NEW_METHODOLOGY
        as_of = doc["as_of"]
        n_projects = 0
        for p in doc.get("projects", []):
            a = p.get("assessment")
            if not a:
                continue
            n_projects += 1
            old_allowance = a.get("allowance", 0)
            a["allowance"] = 0
            a["allowance_rationale"] = ALLOWANCE_NOTE
            # Drop evidence unavailable at the original scoring date: a promise
            # whose effective_at is after the run's as_of was backfilled later
            # and must not appear in restated history.
            kept = []
            for pr in a["promises"]:
                if pr["effective_at"] > as_of:
                    print(f"  EXCLUDED {p['slug']}/{pr['lineage']}: effective_at {pr['effective_at']} > as_of {as_of}")
                else:
                    kept.append(pr)
            a["promises"] = kept
            # sanity: earned must be derivable from promises alone
            earned = sum(
                pr["reward"] for pr in a["promises"]
                if not pr["core"] and pr["state"] == "active"
            )
            print(f"  {p['slug']}: previously {a.get('capacity')}-cap "
                  f"allowance {old_allowance} -> earned-only ({earned} earned)")
        out = DST / f"{src.stem}-earnedonly.json"
        out.write_text(json.dumps(doc, indent=2) + "\n")
        print(f"{src.name} -> {out.name} ({n_projects} projects)")
        done += 1
    print(f"Restated {done} runs into {DST}")

if __name__ == "__main__":
    sys.exit(main())
