/**
 * Live AI status-change scanner: pure matching and proposal-drafting logic.
 *
 * The scanner is proposal-only: it drafts evidence / assessment / claim_repeated
 * events with quoted sources into a review queue. A human approves; publication
 * is what fires notifications. The scanner never writes the published ledger.
 *
 * Matching is deliberately conservative: a false positive push kills trust in
 * the channel faster than a miss. Every match decision is logged with the
 * article URL and reasoning so misses can be audited.
 */

export interface OpenPromise {
  lineage: string;
  criteria: string;
  claimType?: string;
}

export interface NewsArticle {
  url: string;
  title: string;
  publisher: string;
  published_at: string;
}

export interface MatchDecision {
  lineage: string | null;
  matched: boolean;
  reasoning: string;
}

export interface DraftProposal {
  kind: "evidence" | "assessment" | "claim_repeated";
  lineage: string;
  payload: Record<string, unknown>;
  reasoning: string;
}

const STOPWORDS = new Set(
  "the,a,an,to,of,and,or,for,in,on,at,by,with,from,as,is,are,was,were,be,been,being,it,its,this,that,these,those,their,they,them,he,she,we,you,his,her,our,your,will,shall,can,could,would,should,may,might,must,not,no,yes,if,then,than,so,such,into,over,under,after,before,during,while,about,against,between,through,per,each,all,any,both,few,more,most,other,some,only,own,same,too,very,just,also,well,now,today,here,there,when,where,which,who,whom,what,how,why,new,first,top,best,big,more,less,up,down,out,off,back,still,already,yet,even,ever,never,always,often,once,twice,make,made,do,does,did,done,get,got,give,given,take,took,come,came,go,goes,went,see,seen,say,said,says,like,plan,plans,planned,aim,aims,target,targets,set,sets,launch,launches,crypto,token,coin,price,market,million,billion,trillion,percent,network,second,usd,report,data,growth,users,company,group,team".split(","),
);

export function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w));
  return [...new Set(words)];
}

/** Price/converter spam is never promise evidence. */
const SPAM_TITLE_RE = /(price prediction|price analysis|price forecast|how to buy|convert [\d.]|airdrop|giveaway|presale)/i;

/**
 * Conservative rule-based match: an article matches a lineage only when the
 * headline shares at least two promise-SPECIFIC keywords with the promise
 * criteria. Project-name tokens are excluded from the keyword set (the
 * project-level feed already gates on the project; "Avalanche" matching an
 * Avalanche promise is not a signal). Returns the decision for audit logging
 * either way.
 */
export function matchLineage(
  article: NewsArticle,
  promise: OpenPromise,
  projectTokens: string[] = [],
): MatchDecision {
  if (SPAM_TITLE_RE.test(article.title)) {
    return { lineage: promise.lineage, matched: false, reasoning: "Excluded as price/converter spam; never promise evidence." };
  }
  const excluded = new Set(projectTokens.map((t) => t.toLowerCase()));
  const keywords = extractKeywords(promise.criteria + " " + (promise.claimType ?? ""))
    .filter((k) => !excluded.has(k));
  if (keywords.length === 0) {
    return { lineage: promise.lineage, matched: false, reasoning: "No promise-specific keywords after excluding project-name tokens; skipped." };
  }
  const haystack = `${article.title} ${article.publisher}`.toLowerCase();
  const hits = keywords.filter((k) => new RegExp(`\\b${k}\\b`).test(haystack));
  const matched = hits.length >= 2;
  return {
    lineage: promise.lineage,
    matched,
    reasoning: matched
      ? `Headline shares ${hits.length} promise-specific keyword(s): ${hits.slice(0, 5).join(", ")}.`
      : `Headline shares ${hits.length} promise-specific keyword(s); below the 2-keyword threshold.`,
  };
}

const FULFILLED_SIGNALS = /(launches|launched|ships|shipped|delivers|delivered|rolls out|goes live|released|hits (its )?target|achieves|achieved|completes|completed)/i;
const LAPSED_SIGNALS = /(scraps|scrapped|cancels|cancelled|cancelling|abandons|abandoned|delays|delayed|misses|missed|fails to|falls short|pushes back|postpones|postponed)/i;
const REPEATED_SIGNALS = /(reiterates|reiterated|reaffirms|reaffirmed|doubles down|restates|restated|again (promises|pledges|vows)|commits (again|to))/i;

/**
 * Draft proposals for one matched (article, promise) pair. Evidence is always
 * proposed with stance "context" (conservative: a headline match is not proof).
 * An assessment change is proposed only on explicit delivery/failure signals in
 * the headline, and a claim_repeated only on explicit restatement signals.
 * Everything is machine-drafted for human review.
 */
export function draftProposals(
  article: NewsArticle,
  promise: OpenPromise,
  decision: MatchDecision,
  now = new Date(),
): DraftProposal[] {
  const proposals: DraftProposal[] = [];
  const occurredOn = article.published_at.slice(0, 10);
  proposals.push({
    kind: "evidence",
    lineage: promise.lineage,
    payload: {
      kind: "evidence",
      lineage: promise.lineage,
      occurredOn,
      summary: article.title,
      author: "promise-news scanner (machine draft)",
      stance: "context",
      source: { url: article.url, title: `${article.title} (${article.publisher})`, publishedOn: occurredOn },
      provenance: ["news-mention-scanner"],
    },
    reasoning: `Scanner match: ${decision.reasoning} Headline alone is not delivery proof, so stance is context.`,
  });
  if (FULFILLED_SIGNALS.test(article.title) && !LAPSED_SIGNALS.test(article.title)) {
    proposals.push({
      kind: "assessment",
      lineage: promise.lineage,
      payload: {
        kind: "assessment",
        lineage: promise.lineage,
        occurredOn: now.toISOString().slice(0, 10),
        summary: `Proposed: fulfilled. Signal in headline: "${article.title}"`,
        author: "promise-news scanner (machine draft)",
        state: "fulfilled",
        reasoning: `Headline carries an explicit delivery signal: "${article.title}". Human must verify against the source before publication.`,
        source: { url: article.url, title: `${article.title} (${article.publisher})`, publishedOn: occurredOn },
      },
      reasoning: `Headline matches delivery language ("${article.title.match(FULFILLED_SIGNALS)?.[0]}"). Proposed fulfilled; requires human verification.`,
    });
  } else if (LAPSED_SIGNALS.test(article.title)) {
    proposals.push({
      kind: "assessment",
      lineage: promise.lineage,
      payload: {
        kind: "assessment",
        lineage: promise.lineage,
        occurredOn: now.toISOString().slice(0, 10),
        summary: `Proposed: lapsed. Signal in headline: "${article.title}"`,
        author: "promise-news scanner (machine draft)",
        state: "lapsed",
        reasoning: `Headline carries an explicit failure/delay signal: "${article.title}". Human must verify against the source before publication.`,
        source: { url: article.url, title: `${article.title} (${article.publisher})`, publishedOn: occurredOn },
      },
      reasoning: `Headline matches failure/delay language ("${article.title.match(LAPSED_SIGNALS)?.[0]}"). Proposed lapsed; requires human verification.`,
    });
  }
  if (REPEATED_SIGNALS.test(article.title)) {
    proposals.push({
      kind: "claim_repeated",
      lineage: promise.lineage,
      payload: {
        kind: "claim_repeated",
        lineage: promise.lineage,
        occurredOn,
        summary: `Restated: "${article.title}"`,
        author: "promise-news scanner (machine draft)",
        wordingChange: "same",
        source: { url: article.url, title: `${article.title} (${article.publisher})`, publishedOn: occurredOn },
      },
      reasoning: `Headline carries restatement language ("${article.title.match(REPEATED_SIGNALS)?.[0]}"). Wording change needs human judgment; defaulted to same.`,
    });
  }
  return proposals;
}

export interface AiJudgment {
  relevant: boolean;
  stance: "supports" | "refutes" | "context";
  reasoning: string;
  assessment: "fulfilled" | "lapsed" | null;
}

/**
 * Optional AI relevance judgment. When SCANNER_AI_URL and SCANNER_AI_API_KEY
 * are set, an OpenAI-compatible chat-completions endpoint judges relevance
 * (paraphrase, implication) that keyword matching cannot. Any failure falls
 * back to null, and the caller keeps the rule-based decision.
 */
export async function aiJudge(
  article: NewsArticle,
  promise: OpenPromise,
  fetcher: typeof fetch = fetch,
): Promise<AiJudgment | null> {
  const url = process.env.SCANNER_AI_URL;
  const key = process.env.SCANNER_AI_API_KEY;
  if (!url || !key) return null;
  const model = process.env.SCANNER_AI_MODEL ?? "gpt-4o-mini";
  try {
    const res = await fetcher(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You judge whether a news headline is relevant to a tracked promise. " +
              "Reply with JSON: {\"relevant\": boolean, \"stance\": \"supports\"|\"refutes\"|\"context\", " +
              "\"reasoning\": string, \"assessment\": \"fulfilled\"|\"lapsed\"|null}. " +
              "Be conservative: relevant only if the headline clearly concerns the promise's subject. " +
              "Set assessment only on explicit delivery or failure language.",
          },
          {
            role: "user",
            content: `Promise: ${promise.criteria}\nHeadline: ${article.title}\nPublisher: ${article.publisher}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content) as Partial<AiJudgment>;
    if (typeof parsed.relevant !== "boolean") return null;
    const stance = parsed.stance === "supports" || parsed.stance === "refutes" ? parsed.stance : "context";
    const assessment = parsed.assessment === "fulfilled" || parsed.assessment === "lapsed" ? parsed.assessment : null;
    return {
      relevant: parsed.relevant,
      stance,
      reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning.slice(0, 500) : "",
      assessment,
    };
  } catch {
    return null;
  }
}
