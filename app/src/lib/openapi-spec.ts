/**
 * OpenAPI 3.0 spec for the public Prove-It v1 API.
 * Served at /api/v1/openapi.json and rendered by Swagger UI on /developers.
 */
export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Prove-It Scores API",
    version: "1.0.0",
    description:
      "Did crypto projects actually deliver what they promised? Read-only access to Prove-It hearts, the Shitcoin warning dial, CODE activity, and HYPE attention for every scored project. No authentication. Fair use: keep request volume reasonable.",
  },
  servers: [{ url: "https://prove-it-clock.vercel.app/api/v1" }],
  paths: {
    "/scores": {
      get: {
        summary: "List scored projects",
        description:
          "Every project in the scored universe, ranked by market cap. Hearts are earned only: each heart maps to a promise and evidence.",
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
          "Full detail for a project: hearts, Shitcoin warning dial, CODE, HYPE, every tracked promise with its state and hearts earned, and the proof-history timeline.",
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
          hearts: {
            type: "object",
            description: "Hearts are earned only. No allowances, no time decay.",
            properties: {
              earned: { type: "integer", example: 5 },
              capacity: { type: "integer", example: 20 },
            },
          },
          shitcoin_warning: {
            type: "object",
            description:
              "The public Shitcoin warning dial. Fixed positions, not a computed score: 1 = clean delivery record, 4 = watch, 7 = supporting failure, 10 = core failure.",
            properties: {
              level: { type: "integer", minimum: 1, maximum: 10, example: 1 },
              scale: { type: "integer", example: 10 },
              label: { type: "string", example: "Shitcoin warning" },
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
                      description: "Only fulfilled promises earn hearts. Lapsed or retired promises visibly fall.",
                    },
                    core: { type: "boolean", description: "Whether this is a main promise of the project." },
                    reward_hearts: { type: "integer" },
                  },
                },
              },
              history: {
                type: "array",
                description: "Proof history: hearts earned over time. Rises and falls are the story.",
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
