-- ============================================================================
-- The Prove-It Clock — initial schema
-- Migration 001
--
-- Design rules (from the build brief, enforced by convention):
--   * Methodology versioning from day one: every score row references the
--     methodology version that produced it.
--   * History is append-only: the pipeline only INSERTs. Corrections arrive
--     as new rows (and, when the algorithm itself changes, as a new
--     methodology version). There are no UPDATE paths in the pipeline.
--   * Raw observations are stored BEFORE any scoring runs, so any snapshot
--     can be reproduced from (observations + methodology config).
--   * MEASURED FACT vs MODELING DECISION: metric_observations carry their
--     data_sources row; analyst-assessed inputs (theses, milestone
--     achievements, token necessity, potential) live in project_theses /
--     project_milestones / project_assessments with evidence links.
-- ============================================================================

-- Required for gen_random_uuid() (pre-installed in Supabase).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- Reference data
-- ----------------------------------------------------------------------------

CREATE TABLE thesis_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        TEXT NOT NULL UNIQUE,          -- e.g. 'monetary', 'execution'
    name        TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE data_sources (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        TEXT NOT NULL UNIQUE,          -- 'coingecko' | 'defillama' | 'analyst' | ...
    name        TEXT NOT NULL,
    url         TEXT,
    requires_key BOOLEAN NOT NULL DEFAULT FALSE,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- Methodology versioning (mandatory from day one)
-- ----------------------------------------------------------------------------

CREATE TABLE methodology_versions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version     TEXT NOT NULL UNIQUE,          -- semver, e.g. '0.1.0'
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    changelog   TEXT NOT NULL,
    config_json JSONB NOT NULL,                -- full frozen copy of the config
    is_current  BOOLEAN NOT NULL DEFAULT FALSE
);
-- Only one current version at a time (partial unique index).
CREATE UNIQUE INDEX methodology_versions_one_current
    ON methodology_versions (is_current) WHERE is_current;

-- ----------------------------------------------------------------------------
-- Projects and their theses
-- ----------------------------------------------------------------------------

CREATE TABLE projects (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug              TEXT NOT NULL UNIQUE,    -- 'btc' | 'eth' | ...
    name              TEXT NOT NULL,
    symbol            TEXT NOT NULL,
    coingecko_id      TEXT,                    -- vendor id, nullable (LINK has none on DefiLlama etc.)
    defillama_slug    TEXT,                    -- chain/protocol slug where applicable
    thesis_category_id UUID REFERENCES thesis_categories(id),
    launch_date       DATE,                    -- best-known network launch; source in notes
    launch_notes      TEXT,
    status            TEXT NOT NULL DEFAULT 'active',  -- active | inactive | dead
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A project's stated thesis, versioned alongside methodology so thesis
-- edits never silently rewrite what a past score was measured against.
CREATE TABLE project_theses (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id            UUID NOT NULL REFERENCES projects(id),
    methodology_version_id UUID NOT NULL REFERENCES methodology_versions(id),
    thesis_text           TEXT NOT NULL,
    measurable_success    TEXT NOT NULL,       -- what "thesis succeeded" would observably look like
    evidence_url          TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (project_id, methodology_version_id)
);

-- Analyst-assessed per-project parameters (MODELING DECISIONS, not measured
-- facts): token necessity, token value capture, world-impact potential, etc.
-- Each row is tied to a methodology version and carries its rationale.
CREATE TABLE project_assessments (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id            UUID NOT NULL REFERENCES projects(id),
    methodology_version_id UUID NOT NULL REFERENCES methodology_versions(id),
    key                   TEXT NOT NULL,       -- 'token_necessity' | 'token_value_capture' | 'world_impact_potential' | ...
    value                 NUMERIC NOT NULL,    -- 0..10 scale unless documented otherwise
    rationale             TEXT NOT NULL,
    evidence_url          TEXT,
    assessed_at           DATE NOT NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (project_id, methodology_version_id, key)
);

-- ----------------------------------------------------------------------------
-- Metrics: definitions + raw observations (raw data FIRST)
-- ----------------------------------------------------------------------------

CREATE TABLE metric_definitions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code             TEXT NOT NULL UNIQUE,     -- 'market_cap_usd' | 'daily_fees_usd' | ...
    name             TEXT NOT NULL,
    description      TEXT NOT NULL,
    unit             TEXT,
    category         TEXT NOT NULL,            -- 'market' | 'chain' | 'development' | 'attention' | 'supply'
    higher_is_better  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Raw observations, exactly as normalized from provider payloads.
-- value_json holds structured extras (e.g. full 30-day fee series summary);
-- raw_payload_json holds the untouched provider response excerpt for audit.
CREATE TABLE metric_observations (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id     UUID NOT NULL REFERENCES projects(id),
    metric_id      UUID NOT NULL REFERENCES metric_definitions(id),
    source_id      UUID NOT NULL REFERENCES data_sources(id),
    observed_at    TIMESTAMPTZ NOT NULL,        -- when the upstream data point is dated
    ingested_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    value_numeric  NUMERIC,                     -- NULL when the provider has no data
    value_json     JSONB,
    raw_payload_json JSONB,
    is_available   BOOLEAN NOT NULL DEFAULT TRUE,
    notes          TEXT,
    UNIQUE (project_id, metric_id, source_id, observed_at)
);
CREATE INDEX metric_observations_project_time
    ON metric_observations (project_id, metric_id, observed_at DESC);

-- ----------------------------------------------------------------------------
-- Scores: definitions, components, snapshots (append-only)
-- ----------------------------------------------------------------------------

CREATE TABLE score_definitions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        TEXT NOT NULL UNIQUE,
    -- 'reality' | 'world_impact_potential' | 'execution_evidence' |
    -- 'reflexivity_risk' | 'development' | 'attention' |
    -- 'evidence_confidence' | 'token_necessity' | 'token_value_capture' |
    -- 'subsidy_dependence' | 'hype_gap' | 'build_gap' | 'belief_gap' |
    -- 'promise_gap' | 'prove_it_age_years'
    name        TEXT NOT NULL,
    description TEXT NOT NULL,
    scale_min   NUMERIC NOT NULL,
    scale_max   NUMERIC NOT NULL,
    kind        TEXT NOT NULL,                 -- 'dimension' | 'supporting' | 'derived' | 'analyst'
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE score_components (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    score_id    UUID NOT NULL REFERENCES score_definitions(id),
    code        TEXT NOT NULL,                 -- unique within its score
    name        TEXT NOT NULL,
    description TEXT NOT NULL,
    UNIQUE (score_id, code)
);

-- Weights and rules are per-methodology-version, never global.
CREATE TABLE methodology_weights (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    methodology_version_id UUID NOT NULL REFERENCES methodology_versions(id),
    component_id          UUID NOT NULL REFERENCES score_components(id),
    weight                NUMERIC NOT NULL,
    normalization_json    JSONB NOT NULL,      -- {type:'log_scale'|'linear'|'ladder', ...}
    gate_json             JSONB,               -- gates/caps applied, NULL if none
    UNIQUE (methodology_version_id, component_id)
);

-- One row per (project, methodology version, date, score). Append-only.
CREATE TABLE score_snapshots (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id            UUID NOT NULL REFERENCES projects(id),
    methodology_version_id UUID NOT NULL REFERENCES methodology_versions(id),
    snapshot_date         DATE NOT NULL,
    score_code            TEXT NOT NULL REFERENCES score_definitions(code),
    value                 NUMERIC,             -- NULL when unavailable
    confidence            NUMERIC,             -- 0..100, NULL when unavailable
    status                TEXT NOT NULL,       -- 'final' | 'provisional' | 'unavailable'
    unavailable_reason    TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (project_id, methodology_version_id, snapshot_date, score_code)
);
CREATE INDEX score_snapshots_lookup
    ON score_snapshots (project_id, snapshot_date DESC, score_code);

-- Component-level values behind each dimension score (the drill-down trail).
CREATE TABLE score_component_values (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id            UUID NOT NULL REFERENCES projects(id),
    methodology_version_id UUID NOT NULL REFERENCES methodology_versions(id),
    snapshot_date         DATE NOT NULL,
    score_code            TEXT NOT NULL,
    component_code        TEXT NOT NULL,
    value                 NUMERIC,             -- 0..10 normalized component score, NULL if unavailable
    weight_applied        NUMERIC,
    metric_codes          TEXT[] NOT NULL DEFAULT '{}',  -- observations feeding this component
    is_available          BOOLEAN NOT NULL DEFAULT TRUE,
    notes                 TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (project_id, methodology_version_id, snapshot_date, score_code, component_code)
);

-- ============================================================================
-- The Prove-It Clock — migration 001 (continued)
-- Milestones, timeline events, explanations, later-phase stubs, RLS.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Thesis milestone ladders (category-specific) + per-project achievement
-- ----------------------------------------------------------------------------

-- The ladder rungs themselves are methodology-versioned: changing what
-- "Level 3" means is a methodology change, not a silent edit.
CREATE TABLE milestone_definitions (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    methodology_version_id UUID NOT NULL REFERENCES methodology_versions(id),
    thesis_category_id    UUID NOT NULL REFERENCES thesis_categories(id),
    level                 INT NOT NULL CHECK (level BETWEEN 0 AND 5),
    title                 TEXT NOT NULL,
    evidence_requirements TEXT NOT NULL,       -- what counts; marketing claims do not
    UNIQUE (methodology_version_id, thesis_category_id, level)
);

-- Whether a project has demonstrably achieved each rung, with evidence.
-- Marketing claims and partnership announcements do NOT count (enforced by
-- the evidence_requirements text, reviewed by analysts).
CREATE TABLE project_milestones (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id              UUID NOT NULL REFERENCES projects(id),
    milestone_definition_id UUID NOT NULL REFERENCES milestone_definitions(id),
    achieved                BOOLEAN NOT NULL DEFAULT FALSE,
    achieved_at             DATE,
    evidence_url            TEXT,
    evidence_summary        TEXT,
    assessed_at             DATE NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (project_id, milestone_definition_id)
);

-- ----------------------------------------------------------------------------
-- Prove-It timeline: the project's history as dated events
-- ----------------------------------------------------------------------------

CREATE TABLE project_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID NOT NULL REFERENCES projects(id),
    event_date  DATE NOT NULL,
    event_type  TEXT NOT NULL,   -- 'launch' | 'thesis' | 'release' | 'integration'
                                -- | 'adoption' | 'setback' | 'thesis_change' | 'promise'
    title       TEXT NOT NULL,
    description TEXT,
    evidence_url TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX project_events_timeline
    ON project_events (project_id, event_date);

-- ----------------------------------------------------------------------------
-- Explanations: why a score moved (AI summarizes these later; the pipeline
-- computes the contributor deltas deterministically)
-- ----------------------------------------------------------------------------

CREATE TABLE explanations (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id            UUID NOT NULL REFERENCES projects(id),
    methodology_version_id UUID NOT NULL REFERENCES methodology_versions(id),
    snapshot_date         DATE NOT NULL,
    score_code            TEXT NOT NULL,
    delta                 NUMERIC,             -- vs previous snapshot under same methodology
    summary               TEXT NOT NULL,
    contributors_json     JSONB NOT NULL DEFAULT '[]',
    -- contributors_json: [{component_code, direction:'+'|'-', text, metric_code}]
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (project_id, methodology_version_id, snapshot_date, score_code)
);

-- ----------------------------------------------------------------------------
-- Later-phase stubs (brief sections 3 / 22): created now so the shape is
-- stable; the community layer stays inert until Phase 3.
-- ----------------------------------------------------------------------------

CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handle      TEXT NOT NULL UNIQUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE evidence_submissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id),
    submitted_by    UUID REFERENCES users(id),
    claim           TEXT NOT NULL,
    evidence_url    TEXT NOT NULL,
    metric_code     TEXT,
    direction       TEXT,                    -- 'supports' | 'contradicts'
    explanation     TEXT,
    review_status   TEXT NOT NULL DEFAULT 'pending',  -- pending|accepted|rejected
    reviewed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE evidence_votes (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES evidence_submissions(id),
    voted_by      UUID REFERENCES users(id),
    vote          TEXT NOT NULL,             -- 'support'|'dispute'|'needs_context'|'duplicate'|'invalid_source'
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (submission_id, voted_by)
);

CREATE TABLE methodology_proposals (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposed_by           UUID REFERENCES users(id),
    title                 TEXT NOT NULL,
    description           TEXT NOT NULL,
    proposed_config_json  JSONB,
    status                TEXT NOT NULL DEFAULT 'open',  -- open|accepted|rejected
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE community_scores (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id            UUID NOT NULL REFERENCES projects(id),
    submitted_by          UUID REFERENCES users(id),
    score_code            TEXT NOT NULL,
    value                 NUMERIC NOT NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
    -- NOTE: community opinion NEVER feeds algorithmic scores automatically.
    -- It is stored separately and displayed alongside (Belief Gap), per brief.
);

-- ----------------------------------------------------------------------------
-- Read access: the site is a public research terminal.
-- ----------------------------------------------------------------------------

ALTER TABLE thesis_categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources           ENABLE ROW LEVEL SECURITY;
ALTER TABLE methodology_versions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects               ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_theses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assessments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_definitions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_observations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_definitions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_components       ENABLE ROW LEVEL SECURITY;
ALTER TABLE methodology_weights    ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_snapshots        ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_component_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_definitions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones     ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE explanations           ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'thesis_categories','data_sources','methodology_versions','projects',
        'project_theses','project_assessments','metric_definitions',
        'metric_observations','score_definitions','score_components',
        'methodology_weights','score_snapshots','score_component_values',
        'milestone_definitions','project_milestones','project_events',
        'explanations'
    ] LOOP
        EXECUTE format(
            'CREATE POLICY public_read ON %I FOR SELECT TO anon, authenticated USING (true)',
            t
        );
    END LOOP;
END $$;
