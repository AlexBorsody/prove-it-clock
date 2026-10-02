/**
 * OpenAPI 3.0 spec for the public Prove-It v1 API.
 * Served at /api/v1/openapi.json and rendered by Swagger UI on /developers.
 */
export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Prove Value Promise API",
    version: "1.1.0",
    description:
      "Did crypto projects actually deliver what they promised? Read-only access to published promise records, CODE activity and HYPE attention. No project-level warning score. No authentication. Fair use: keep request volume reasonable.",
  },
  servers: [{ url: "https://prove-it-clock.vercel.app/api/v1" }],
  paths: {
    "/mentions/{slug}": {
      get: {
        summary: "Explore a project's news sources",
        description: "Current rolling seven-day Google News RSS sample with project-matching headlines, cached for one hour. Returns article links, publishers and publication times. Not exhaustive coverage, social posts, or persisted historical evidence. Unknown projects return 404; provider failures return 503, never a zero count.",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string", enum: ["btc", "eth", "xrp", "sol", "link", "avax", "dash", "bat"] } }],
        responses: {
          "200": { description: "News feed sample", content: { "application/json": { schema: {
            type: "object", required: ["slug", "provider", "fetched_at", "window_start", "window_end", "source_url", "articles", "feed_items"],
            properties: {
              slug: { type: "string" }, provider: { type: "string", enum: ["Google News RSS"] },
              fetched_at: { type: "string", format: "date-time" }, window_start: { type: "string", format: "date-time" }, window_end: { type: "string", format: "date-time" },
              source_url: { type: "string", format: "uri" }, feed_items: { type: "integer", description: "Raw feed items before validation and URL deduplication" },
              articles: { type: "array", items: { type: "object", required: ["url", "title", "publisher", "publisher_url", "published_at"], properties: {
                url: { type: "string", format: "uri" }, title: { type: "string" }, publisher: { type: "string" }, publisher_url: { type: "string", format: "uri", nullable: true }, published_at: { type: "string", format: "date-time" }
              } } }
            }
          } } } },
          "404": { description: "Unknown project" }, "503": { description: "News provider unavailable; retry later" }
        }
      }
    },
    "/scores": {
      get: {
        summary: "List scored projects",
        description:
          "Every project in the scored universe, ranked by market cap. Only kept promises count: each maps to a promise and its evidence.",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1, minimum: 1 },
          },
          {
            name: "per_page",
            in: "query",
            schema: { type: "integer", default: 20, minimum: 1, maximum: 100 },
          },
        ],
        responses: {
          "200": {
            description: "Paginated score list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/ScoreSummary" } },
                    page: { type: "integer" },
                    per_page: { type: "integer" },
                    total: { type: "integer" },
                    as_of: { type: "string", nullable: true },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/scores/{slug}": {
      get: {
        summary: "Get one project's scores",
        description:
          "Full detail for a project: promise counts, CODE, HYPE, tracked promises with their recorded states, and published promise history.",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string", example: "btc" },
          },
        ],
        responses: {
          "200": {
            description: "Project score detail",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ScoreDetail" },
              },
            },
          },
          "404": { description: "Unknown project slug" },
        },
      },
    },
  },
  components: {
    schemas: {
      ScoreSummary: {
        type: "object",
        properties: {
          slug: { type: "string", example: "btc" },
          name: { type: "string", example: "Bitcoin" },
          symbol: { type: "string", example: "BTC" },
          rank: { type: "integer", description: "Market-cap rank. Rank only, never a scoring input.", example: 1 },
          genesis: { type: "boolean", description: "Bitcoin-only Genesis designation. Its historical promise inventory remains available.", example: true },
          hearts: {
            type: "object",
            description: "Only kept promises count. No allowances, no time decay.",
            properties: {
              earned: { type: "integer", example: 5 },
              capacity: { type: "integer", example: 20 },
            },
          },
          code: {
            type: "object",
            properties: {
              commits_90d: { type: "integer", nullable: true, description: "Commits in the tracked repo over the last 90 days. Null when GitHub is unreachable." },
            },
          },
          hype: {
            type: "object",
            properties: {
              mentions_7d: { type: "integer", nullable: true, description: "News/social mentions over the last 7 days. Null while the baseline is still collecting." },
            },
          },
        },
      },
      ScoreDetail: {
        allOf: [
          { $ref: "#/components/schemas/ScoreSummary" },
          {
            type: "object",
            properties: {
              promises: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    criteria: { type: "string" },
                    state: {
                      type: "string",
                      enum: ["open", "fulfilled", "lapsed", "retired"],
                      description: "Only fulfilled promises count. Lapsed or retired promises visibly fall.",
                    },
                    core: { type: "boolean", description: "Whether this is a main promise of the project." },
                    source_url: {
                      type: ["string", "null"],
                      description: "Where the promise was stated: whitepaper, tweet, interview, or article.",
                    },
                  },
                },
              },
              history: {
                type: "array",
                description: "Proof history: promises kept over time. Rises and falls are the story.",
                items: {
                  type: "object",
                  properties: {
                    date: { type: "string", format: "date" },
                    earned: { type: "integer" },
                    capacity: { type: "integer" },
                  },
                },
              },
            },
          },
        ],
      },
    },
  },
};

/**
 * OpenAPI 3.0 spec for the public Prove-It v2 API.
 * Served at /api/v2/openapi.json and rendered on /developers below the v1 docs.
 *
 * v2 is the three-meter contract: weighted verdicts (proven delivery,
 * outcome coverage, kept among resolved) over reviewed 1/2/4 importance
 * weights, per-category rankings behind the reviewed-weight availability
 * gate, the promise ledger with evidence, and the methodology record.
 * Unavailable metrics return null with a reason; nothing is invented.
 */
export const openApiSpecV2 = {
  openapi: "3.0.3",
  info: {
    title: "Prove Value Promise API (v2)",
    version: "2.0.0",
    description:
      "Did crypto projects actually deliver what they promised? Read-only three-meter verdicts, per-category rankings, the promise ledger with evidence, and the methodology record. Weights: supporting 1, material 2, core 4, reviewed only. Retirement is a lifecycle state, not an outcome: a retired promise without a reviewed fulfillment judgment is unknown, never a failure. No authentication. Fair use: keep request volume reasonable.",
  },
  servers: [{ url: "https://prove-it-clock.vercel.app/api/v2" }],
  paths: {
    "/verdicts": {
      get: {
        summary: "Three-meter verdicts for all projects",
        description:
          "Every tracked project with its three-meter verdict (proven delivery, outcome coverage, kept among resolved), core finding, and per-category breakdown. Weighted metrics are null with a reason until editorial weights are reviewed.",
        parameters: [],
        responses: {
          "200": {
            description: "Project verdicts",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data", "meta"],
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        projects: {
                          type: "array",
                          items: {
                            type: "object",
                            required: ["slug", "name", "verdict"],
                            properties: {
                              slug: { type: "string" },
                              name: { type: "string" },
                              genesis: { type: "boolean", description: "Genesis asset: outside the delivery pipeline, never ranked." },
                              hearts: {
                                type: "object",
                                properties: {
                                  kept: { type: "integer", description: "One kept promise earns one heart. Only earned hearts exist." },
                                  total: { type: "integer" },
                                },
                              },
                              verdict: {
                                type: "object",
                                properties: {
                                  proven_delivery: { type: "number", nullable: true, description: "100 * K / W: weighted share of kept promises." },
                                  outcome_coverage: { type: "number", nullable: true, description: "100 * R / W: weighted share with resolved outcomes." },
                                  kept_among_resolved: { type: "number", nullable: true, description: "100 * K / R: breakdown only, never a standalone verdict." },
                                  core_finding: { type: "string", enum: ["kept", "lapsed", "unresolved", "unavailable", "none"] },
                                  unavailable_reason: { type: "string", nullable: true },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    meta: { type: "object", description: "Pinned data, methodology, taxonomy, assignment, and rules versions." },
                  },
                },
              },
            },
          },
          "503": { description: "Promise ledger unavailable; retry later" },
        },
      },
    },
    "/verdicts/{slug}": {
      get: {
        summary: "Three-meter verdict for one project",
        description: "Verdict detail with per-category three-meter breakdown for a single project slug.",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string", example: "bat" } }],
        responses: {
          "200": { description: "Project verdict detail" },
          "404": { description: "Unknown project slug" },
          "503": { description: "Promise ledger unavailable; retry later" },
        },
      },
    },
    "/rankings/{category}": {
      get: {
        summary: "Per-category ranking by proven delivery",
        description:
          "Projects ranked by proven delivery (weighted kept share) within one promise category. Behind the reviewed-weight availability gate: weighted_available is false with an availability reason until editorial weights are reviewed. Rankable rows sort by full precision with ties; projects with no resolved outcomes or no weights are listed last with their unranked reason. Never ranks by resolved share alone.",
        parameters: [{ name: "category", in: "path", required: true, schema: { type: "string", description: "Category id from /methodology" } }],
        responses: {
          "200": { description: "Category ranking" },
          "404": { description: "Unknown category" },
          "503": { description: "Promise ledger unavailable; retry later" },
        },
      },
    },
    "/promises": {
      get: {
        summary: "The promise ledger with evidence",
        description: "Every tracked promise with its claim, state, reviewed importance, category, fulfillment test, and claim/outcome sources.",
        parameters: [
          { name: "project", in: "query", schema: { type: "string", description: "Project slug filter" } },
          { name: "category", in: "query", schema: { type: "string", description: "Category id filter" } },
          { name: "state", in: "query", schema: { type: "string", enum: ["kept", "open", "in_progress", "lapsed", "retired", "unknown"], description: "Promise state filter" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1, minimum: 1 } },
          { name: "per_page", in: "query", schema: { type: "integer", default: 50, minimum: 1, maximum: 200 } },
        ],
        responses: {
          "200": { description: "Paginated promise ledger" },
          "503": { description: "Promise ledger unavailable; retry later" },
        },
      },
    },
    "/methodology": {
      get: {
        summary: "The methodology record",
        description: "Methodology versions, meter formulas, weight tiers, and state partitions. The human-readable contract behind every number in the API.",
        parameters: [],
        responses: {
          "200": { description: "Methodology record" },
          "503": { description: "Promise ledger unavailable; retry later" },
        },
      },
    },
  },
};
