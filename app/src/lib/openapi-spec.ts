/**
 * OpenAPI 3.0 spec for the public Prove-It v1 API.
 * Served at /api/v1/openapi.json and rendered by Swagger UI on /developers.
 */
import { LEGACY_HEARTS_METHODOLOGY } from './heart-data';
import { VERDICT_METHODOLOGY } from './promise-assessment';
export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Prove-It Scores API",
    version: "1.1.0",
    description:
      "Did crypto projects actually deliver what they promised? Read-only access to Prove-It hearts, the Shitcoin warning dial, CODE activity, and HYPE attention for every scored project. No authentication. Fair use: keep request volume reasonable.",
  },
  servers: [{ url: "https://prove-it-clock.vercel.app/api/v1" }],
  paths: {
    "/verdicts": {
      get: {
        summary: "Inspect a published delivery calculation and its evidence",
        description: "Selects one published run. Drafts are excluded. Shares are fractions from 0 to 1, never rounded in the API. V3 returns unweighted inventory with null weighted shares. Compatible reviewed records return kept/all weight (provenShare), resolved/all weight (outcomeCoverage), and kept/resolved weight (resolvedShare). No resolved outcomes means a null provenShare; confirmed all-failed is a real zero. Missing importance is unavailable, never defaulted. Bitcoin is a Genesis asset with inventory only. This is not an overall-value ranking.",
        parameters: [
          {name:'run',in:'query',schema:{type:'string',format:'uuid'},description:'Optional immutable run ID. Omit to select latest published run for the selected methodology.'},
          {name:'methodology',in:'query',schema:{type:'string',enum:[LEGACY_HEARTS_METHODOLOGY,VERDICT_METHODOLOGY],default:LEGACY_HEARTS_METHODOLOGY}},
          {name:'assignments',in:'query',schema:{type:'string'},description:'Expected category revision. A mismatch returns 409 instead of changing a receipt denominator.'},
          {name:'project',in:'query',schema:{type:'string'},description:'Project slug. Omit for every project in the selected run.'},
          {name:'category',in:'query',schema:{type:'string',enum:['money','payments','platform','defi','privacy','interoperability','governance','real-world','unclassified']},description:'Primary category only; secondary tags never affect a denominator.'},
          {name:'group',in:'query',schema:{type:'string',enum:['kept','unkept','pending','unknown']},description:'Evidence filter only. Does not remove other outcomes from a calculation denominator.'},
          {name:'promise',in:'query',schema:{type:'string'},description:'Exact record ID from a previous response. Evidence filter only.'},
        ],
        responses: {
          '200': {description:'One published run with summaries, record IDs, evidence and pinned receipt links.',content:{'application/json':{schema:{$ref:'#/components/schemas/VerdictResponse'}}}},
          '400': {description:'Invalid, empty or repeated selector'},
          '404': {description:'No published run or project in the selected run'},
          '409': {description:'Requested category assignment revision unavailable'},
          '503': {description:'Ledger unavailable or invalid; retry later. No clean score is substituted.'},
        },
      },
    },
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
          "Legacy v3 score contract, ordered by market cap. This endpoint does not switch to weighted verdicts; use /verdicts for versioned delivery calculations. Genesis assets have a null warning.",
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
      DeliveryCalculation: {
        type:'object',required:['availability','reason','totalWeight','resolvedWeight','provenShare','outcomeCoverage','resolvedShare','groups'],
        properties:{
          availability:{type:'string',enum:['available','unreviewed','pending','not-applicable']},reason:{type:'string',nullable:true},
          totalWeight:{type:'number',nullable:true},resolvedWeight:{type:'number',nullable:true},
          provenShare:{type:'number',minimum:0,maximum:1,nullable:true},outcomeCoverage:{type:'number',minimum:0,maximum:1,nullable:true},resolvedShare:{type:'number',minimum:0,maximum:1,nullable:true},
          groups:{type:'object',description:'kept, unkept, pending and unknown partitions, each with the exact contributing record IDs.',additionalProperties:{type:'object',properties:{count:{type:'integer'},weight:{type:'number',nullable:true},recordIds:{type:'array',items:{type:'string'}}}}},
        },
      },
      DeliveryCounts: {
        type:'object',properties:{total:{type:'integer'},kept:{type:'integer'},states:{type:'object',additionalProperties:{type:'integer'}},calculation:{$ref:'#/components/schemas/DeliveryCalculation'}},
      },
      VerdictResponse: {
        type:'object',required:['run','as_of','methodology','versions','assignment_version','project_policy','scope','summary_scope','projects','records'],
        properties:{
          run:{type:'string',format:'uuid'},as_of:{type:'string',format:'date-time'},methodology:{type:'string'},
          versions:{type:'object',nullable:true,description:'Published policy, importance, taxonomy, assignment and admission versions; null for legacy v3.'},
          assignment_version:{type:'string'},project_policy:{type:'string'},scope:{type:'object'},summary_scope:{type:'string'},
          projects:{type:'array',items:{type:'object',properties:{
            slug:{type:'string'},name:{type:'string'},genesis:{type:'boolean'},availability:{type:'string'},receipt:{type:'string'},
            summary:{type:'object',nullable:true,description:'Project-wide DeliveryCounts plus primary category counts, factual core finding, genesis and weightedMethodology flags.'},
            scope_summary:{type:'object',nullable:true,description:'DeliveryCounts for the selected category, otherwise the whole project. Group/promise filters never change its denominator.'},
          }}},
          records:{type:'array',items:{type:'object',description:'Each contributing record retains its exact published assessment; claim and outcome sources are separated when recorded.',properties:{
            id:{type:'string'},project:{type:'string'},lineage:{type:'string'},claim:{type:'string'},claim_text_kind:{type:'string'},state:{type:'string'},original_state:{type:'string'},core:{type:'boolean'},category:{type:'string'},outcome:{type:'string'},
            importance:{type:'object',nullable:true},lifecycle:{type:'string',nullable:true},assessed_at:{type:'string',nullable:true},
            claim_sources:{type:'array',items:{type:'object'}},outcome_evidence:{type:'array',items:{type:'object'}},evidence_roles_separated:{type:'boolean'},
            fulfillment_test:{type:'string',nullable:true},rationale:{type:'string',nullable:true},quality_flags:{type:'array',items:{type:'string'}},reviewed_assessment:{type:'object',nullable:true},receipt:{type:'string'},
          }}},
        },
      },
      ScoreSummary: {
        type: "object",
        properties: {
          slug: { type: "string", example: "btc" },
          name: { type: "string", example: "Bitcoin" },
          symbol: { type: "string", example: "BTC" },
          genesis: {type:'boolean',description:'Bitcoin-only product designation; excluded from comparative verdicts, with its published inventory retained.'},
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
            nullable: true,
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
                    source_url: {
                      type: ["string", "null"],
                      description: "Where the promise was stated: whitepaper, tweet, interview, or article.",
                    },
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
