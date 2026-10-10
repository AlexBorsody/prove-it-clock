/**
 * OpenAPI 3.0 spec for the public Bubble or Build v1 API.
 * Served at /api/v1/openapi.json and rendered by Swagger UI on /developers.
 */
export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Bubble or Build Promise API",
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
