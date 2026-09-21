#!/usr/bin/env python3
"""
Prove-It Clock — v0.2.0 seed SQL generator (append-only).

Reads the v0.1.0 score_snapshot rows from db/seed/seed-01.sql and emits
db/seed/v020/seed-01.sql, which inserts:

  1. A genuine methodology_versions row for 0.2.0, with config_json frozen
     from app/methodology/v0.2.0.json (the full config, including the
     observer_effect policy and the new potential_outlook derived metric).
  2. 84 score_snapshots rows (6 scored projects x 14 score codes) dated
     2026-09-21:
       - the 9 dimension/supporting scores carried forward EXACTLY from the
         v0.1.0 rows (v0.2.0 changes no dimension/component/config, so a
         re-run of the pipeline would produce identical dimension values);
       - the 5 derived scores computed per the v0.2.0 formulas:
           promise_gap       = world_impact_potential - reality
           build_gap         = development - reality (unavailable: development is null)
           hype_gap          = attention - reality   (unavailable: attention is null)
           belief_gap        = community_reality - algorithmic_reality (unavailable: no community layer)
           potential_outlook = clamp(max(promise_gap, 0) * (execution_evidence / 10), 0, 10)
  3. Retires the speculative v0.3.0 row's is_current flag and marks 0.2.0
     current (0.2.0 is the methodology the product advertises and serves).

Design rules (same as the earlier generators):
  - INSERT-only for data rows (ON CONFLICT (id) DO NOTHING); nothing
    historical is updated or relabeled. v0.1.0 and v0.3.0 rows are untouched.
  - Deterministic UUIDv5-style IDs (namespace "proveit-clock-seed-v1").
  - Missing data stays NULL/unavailable - never zero, never estimated.
  - The script validates itself and exits non-zero on any mismatch.
"""

import hashlib
import json
import re
import sys
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]  # repo root (proveit-top20-main)
APP = ROOT / "app"
SEED_SRC = ROOT / "db" / "seed" / "seed-01.sql"
OUT_DIR = ROOT / "db" / "seed" / "v020"
OUT_FILE = OUT_DIR / "seed-01.sql"

V010_METHODOLOGY_ID = "d77ca462-57cb-529b-9c75-1db17367525d"
SNAPSHOT_DATE = "2026-09-21"

# The six projects with v0.1.0 data (slug -> project UUID, from db/seed/v030/seed-01.sql).
PROJECTS = {
    "btc": "a9b173a8-b996-5a1b-aa94-e8f987299124",
    "eth": "15de9695-1aa6-54a2-80b9-79029c6f79b3",
    "sol": "9f1a1d05-cd5b-5fbd-80a0-a993f66e00a5",
    "xrp": "2cb6fd6a-1754-5e88-b408-3805d17281d2",
    "link": "182d6ffa-b26c-56a6-aa8a-a08b691d8d73",
    "ada": "fa865acf-744a-509b-b53a-193a50e40d48",
}

CARRIED_CODES = [
    "attention",
    "development",
    "execution_evidence",
    "reality",
    "reflexivity_risk",
    "subsidy_dependence",
    "token_necessity",
    "token_value_capture",
    "world_impact_potential",
]
DERIVED_CODES = ["promise_gap", "build_gap", "hype_gap", "belief_gap", "potential_outlook"]

UUID_NAMESPACE = "proveit-clock-seed-v1"


def uuid(name: str) -> str:
    h = bytearray(hashlib.sha1((UUID_NAMESPACE + name).encode()).digest())
    h[6] = (h[6] & 0x0F) | 0x50
    h[8] = (h[8] & 0x3F) | 0x80
    x = bytes(h[:16]).hex()
    return f"{x[:8]}-{x[8:12]}-{x[12:16]}-{x[16:20]}-{x[20:32]}"


def sq(v):
    """SQL string literal (or NULL)."""
    if v is None:
        return "NULL"
    return "'" + str(v).replace("'", "''") + "'"


def num(v):
    """SQL numeric literal (or NULL)."""
    if v is None:
        return "NULL"
    if isinstance(v, Decimal):
        s = format(v.normalize(), "f")
    else:
        s = str(v)
    return s


INSERT_RE = re.compile(
    r"INSERT INTO score_snapshots \(id, project_id, methodology_version_id, snapshot_date, "
    r"score_code, value, confidence, status, unavailable_reason\) VALUES \("
    r"'(?P<id>[^']*)', '(?P<project_id>[^']*)', '(?P<methodology_version_id>[^']*)', "
    r"'(?P<snapshot_date>[^']*)', '(?P<score_code>[^']*)', (?P<value>[^,]*), "
    r"(?P<confidence>[^,]*), '(?P<status>[^']*)', "
    r"(?:NULL|'(?P<unavailable_reason>(?:[^']|'')*)')\)"
)


def parse_sql_literal(tok):
    tok = tok.strip()
    if tok == "NULL":
        return None
    if tok.startswith("'") and tok.endswith("'"):
        return tok[1:-1].replace("''", "'")
    return tok  # numeric literal, keep as string


def load_v010_rows():
    """Parse the v0.1.0 score_snapshot rows for the six projects from seed-01.sql."""
    rows = {}  # (slug, score_code) -> dict(value, confidence, status, unavailable_reason)
    slug_by_uuid = {u: s for s, u in PROJECTS.items()}
    for m in INSERT_RE.finditer(SEED_SRC.read_text()):
        if m.group("methodology_version_id") != V010_METHODOLOGY_ID:
            continue
        pid = m.group("project_id")
        if pid not in slug_by_uuid:
            continue
        slug = slug_by_uuid[pid]
        code = m.group("score_code")
        if code not in CARRIED_CODES:
            continue
        val = parse_sql_literal(m.group("value"))
        conf = parse_sql_literal(m.group("confidence"))
        ur = m.group("unavailable_reason")
        rows[(slug, code)] = {
            "value": None if val is None else Decimal(val),
            "confidence": None if conf is None else int(conf),
            "status": m.group("status"),
            "unavailable_reason": None if ur is None else ur.replace("''", "'"),
        }
    # validate: 6 projects x 9 codes, all present
    assert len(rows) == 6 * 9, f"expected 54 v0.1.0 rows, parsed {len(rows)}"
    for slug in PROJECTS:
        for code in CARRIED_CODES:
            assert (slug, code) in rows, f"missing v0.1.0 row: {slug}/{code}"
    return rows


def q2(d: Decimal) -> Decimal:
    return d.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def compute_derived(rows, slug):
    """Compute the five v0.2.0 derived scores from the carried v0.1.0 values."""
    g = lambda code: rows[(slug, code)]["value"]
    wip, reality = g("world_impact_potential"), g("reality")
    development = g("development")
    attention = g("attention")
    exec_ev = g("execution_evidence")
    assert wip is not None and reality is not None and exec_ev is not None

    promise_gap = wip - reality

    if development is None:
        build_gap = None
        build_gap_reason = (
            "No development data in the v0.1 inputs; "
            "build_gap = development - reality cannot be computed."
        )
    else:
        build_gap = development - reality
        build_gap_reason = None

    if attention is None:
        hype_gap = None
        hype_gap_reason = (
            "No attention data in the v0.1 inputs (Phase 2 adapters); "
            "hype_gap = attention - reality cannot be computed."
        )
    else:
        hype_gap = attention - reality
        hype_gap_reason = None

    belief_gap = None
    belief_gap_reason = (
        "No community-reality layer in v0.1; "
        "belief_gap = community_reality - algorithmic_reality cannot be computed."
    )

    outlook = max(promise_gap, Decimal("0")) * (exec_ev / Decimal("10"))
    outlook = min(max(outlook, Decimal("0")), Decimal("10"))
    potential_outlook = q2(outlook)

    def derived_row(value, reason):
        return {
            "value": value,
            "confidence": None,
            "status": "provisional" if value is not None else "unavailable",
            "unavailable_reason": reason,
        }

    return {
        "promise_gap": derived_row(promise_gap, None),
        "build_gap": derived_row(build_gap, build_gap_reason),
        "hype_gap": derived_row(hype_gap, hype_gap_reason),
        "belief_gap": derived_row(belief_gap, belief_gap_reason),
        "potential_outlook": derived_row(potential_outlook, None),
    }


def main():
    rows = load_v010_rows()

    # --- methodology config ---
    config_path = APP / "methodology" / "v0.2.0.json"
    config = json.loads(config_path.read_text())
    assert config["version"] == "0.2.0", "config version mismatch"
    # v0.2.0 must change no dimension/component vs v0.1.0 (carry-forward premise)
    v010 = json.loads((APP / "methodology" / "v0.1.0.json").read_text())
    for key in ("scores", "components", "gates", "confidence", "categories"):
        assert config[key] == v010[key], f"v0.2.0 unexpectedly changes '{key}' vs v0.1.0"
    assert config["derived"]["potential_outlook"]["available"] is True
    config_json = json.dumps(config, ensure_ascii=True, separators=(",", ":"))
    changelog = config["changelog"]
    assert changelog and len(changelog) > 50

    methodology_id = uuid("v020:methodology:0.2.0")

    # --- build all snapshot rows ---
    statements = []
    seen_ids = set()

    def add_snapshot(slug, code, value, confidence, status, unavailable_reason):
        pid = PROJECTS[slug]
        rid = uuid(f"v020:snapshot:{slug}:{SNAPSHOT_DATE}:{code}")
        assert rid not in seen_ids, f"duplicate row id {rid}"
        seen_ids.add(rid)
        statements.append(
            "INSERT INTO score_snapshots (id, project_id, methodology_version_id, "
            "snapshot_date, score_code, value, confidence, status, unavailable_reason) VALUES "
            f"('{rid}', '{pid}', '{methodology_id}', '{SNAPSHOT_DATE}', '{code}', "
            f"{num(value)}, {num(confidence)}, '{status}', {sq(unavailable_reason)}) "
            "ON CONFLICT (id) DO NOTHING;"
        )

    derived_by_slug = {}
    for slug in PROJECTS:
        for code in CARRIED_CODES:
            r = rows[(slug, code)]
            add_snapshot(slug, code, r["value"], r["confidence"], r["status"], r["unavailable_reason"])
        derived = compute_derived(rows, slug)
        derived_by_slug[slug] = derived
        for code in DERIVED_CODES:
            r = derived[code]
            add_snapshot(slug, code, r["value"], r["confidence"], r["status"], r["unavailable_reason"])

    assert len(statements) == 6 * 14 == 84, f"expected 84 snapshot rows, got {len(statements)}"

    # --- self-check the derived arithmetic against the v0.2.0 formulas ---
    expected_promise = {"btc": "3", "eth": "0.2", "xrp": "5", "sol": "-0.1", "link": "0.5", "ada": "4.9"}
    expected_outlook = {"btc": "2.13", "eth": "0.14", "xrp": "2.15", "sol": "0", "link": "0.22", "ada": "2.11"}
    for slug in PROJECTS:
        pg = derived_by_slug[slug]["promise_gap"]["value"]
        po = derived_by_slug[slug]["potential_outlook"]["value"]
        assert format(pg.normalize(), "f") == expected_promise[slug], f"{slug} promise_gap {pg}"
        assert format(po.normalize(), "f") == expected_outlook[slug], f"{slug} potential_outlook {po}"
        assert derived_by_slug[slug]["build_gap"]["status"] == "unavailable"
        assert derived_by_slug[slug]["hype_gap"]["status"] == "unavailable"
        assert derived_by_slug[slug]["belief_gap"]["status"] == "unavailable"

    # --- emit the SQL file ---
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    lines = []
    lines.append("-- ============================================================================")
    lines.append("-- The Prove-It Clock - seed data (methodology v0.2.0, snapshot 2026-09-21)")
    lines.append("--")
    lines.append("-- APPEND-ONLY: inserts a genuine methodology_versions row for v0.2.0 and")
    lines.append("-- 84 score_snapshots rows (6 scored projects x 14 score codes). No existing")
    lines.append("-- row is updated, relabeled, or deleted; v0.1.0 and v0.3.0 history is preserved.")
    lines.append("--")
    lines.append("-- The 9 dimension/supporting scores are carried forward verbatim from the")
    lines.append("-- v0.1.0 (2026-09-19) rows: v0.2.0 changes no dimension, component, gate,")
    lines.append("-- confidence rule, or category, so a pipeline re-run would produce identical")
    lines.append("-- dimension values. The 5 derived scores are computed per the v0.2.0 formulas")
    lines.append("-- frozen in app/methodology/v0.2.0.json; unavailable inputs stay NULL.")
    lines.append("--")
    lines.append("-- Generated by db/seed/generate-seed-v020.py - do not hand-edit.")
    lines.append("-- Paste into the Supabase SQL editor (runs as postgres, bypasses RLS).")
    lines.append("-- ============================================================================")
    lines.append("BEGIN;")
    lines.append("")
    lines.append("-- 1. Genuine v0.2.0 methodology row (frozen config). Inserted NOT current:")
    lines.append("--    the v0.3.0 row may still hold is_current, and the partial-unique")
    lines.append("--    constraint allows only one TRUE. The flag flip happens in step 2.")
    lines.append(
        "INSERT INTO methodology_versions (id, version, changelog, config_json, is_current) VALUES "
        f"('{methodology_id}', '0.2.0', {sq(changelog)}, {sq(config_json)}::jsonb, FALSE) "
        "ON CONFLICT (id) DO NOTHING;"
    )
    lines.append("")
    lines.append("-- 2. v0.2.0 is the active methodology the product serves: retire the")
    lines.append("--    speculative v0.3.0 row's current flag (only once 0.2.0 exists,")
    lines.append("--    so this script stays re-runnable).")
    lines.append(
        "UPDATE methodology_versions SET is_current = FALSE "
        "WHERE version = '0.3.0' "
        "AND EXISTS (SELECT 1 FROM methodology_versions WHERE version = '0.2.0');"
    )
    lines.append("UPDATE methodology_versions SET is_current = TRUE WHERE version = '0.2.0';")
    lines.append("")
    lines.append("-- 3. Score snapshots: 6 projects x (9 carried + 5 derived) = 84 rows.")
    lines.extend(statements)
    lines.append("")
    lines.append("COMMIT;")
    lines.append("")
    OUT_FILE.write_text("\n".join(lines))
    print(f"wrote {OUT_FILE} ({len(statements)} snapshot rows, methodology id {methodology_id})")

    # --- round-trip check: carried rows in the emitted SQL must match v0.1.0 exactly ---
    emitted = {}
    for m in INSERT_RE.finditer(OUT_FILE.read_text()):
        if m.group("methodology_version_id") != methodology_id:
            continue
        slug = next(s for s, u in PROJECTS.items() if u == m.group("project_id"))
        code = m.group("score_code")
        ur = m.group("unavailable_reason")
        emitted[(slug, code)] = (
            parse_sql_literal(m.group("value")),
            parse_sql_literal(m.group("confidence")),
            m.group("status"),
            None if ur is None else ur.replace("''", "'"),
        )
    assert len(emitted) == 84, f"expected 84 emitted rows, parsed {len(emitted)}"
    for slug in PROJECTS:
        for code in CARRIED_CODES:
            src = rows[(slug, code)]
            src_tuple = (
                None if src["value"] is None else format(src["value"].normalize(), "f"),
                None if src["confidence"] is None else str(src["confidence"]),
                src["status"],
                src["unavailable_reason"],
            )
            # normalize numeric formatting for comparison
            got = list(emitted[(slug, code)])
            if got[0] is not None:
                got[0] = format(Decimal(got[0]).normalize(), "f")
            assert tuple(got) == src_tuple, f"round-trip mismatch {slug}/{code}: {tuple(got)} != {src_tuple}"
    print("round-trip check passed: all 54 carried rows match v0.1.0 exactly")


if __name__ == "__main__":
    sys.exit(main())
