import test from 'node:test';
import assert from 'node:assert/strict';
import {
  aiConfigured,
  aiJudge,
  aiJudgeBatch,
  matchLineage,
  type NewsArticle,
  type OpenPromise,
} from '../src/lib/scan';
import { runPromiseNewsScan } from '../src/lib/scan-runner';

const ARTICLE: NewsArticle = {
  url: 'https://example.com/a',
  title: 'Chainlink mainnet upgrade goes live',
  publisher: 'Example News',
  published_at: '2026-01-01T00:00:00Z',
};
const PROMISES: OpenPromise[] = [
  { lineage: 'mainnet', criteria: 'Ship the decentralized oracle mainnet upgrade' },
  { lineage: 'staking', criteria: 'Launch staking rewards for node operators' },
];

function mockFetcher(calls: { count: number }, body: unknown) {
  return (async (_url: string, _init: unknown) => {
    calls.count++;
    return { ok: true, json: async () => body };
  }) as unknown as typeof fetch;
}

function withAiEnv(fn: () => Promise<void> | void) {
  return async () => {
    const prevUrl = process.env.SCANNER_AI_URL;
    const prevKey = process.env.SCANNER_AI_API_KEY;
    process.env.SCANNER_AI_URL = 'https://ai.example.com/v1/chat/completions';
    process.env.SCANNER_AI_API_KEY = 'test-key';
    try {
      await fn();
    } finally {
      if (prevUrl === undefined) delete process.env.SCANNER_AI_URL;
      else process.env.SCANNER_AI_URL = prevUrl;
      if (prevKey === undefined) delete process.env.SCANNER_AI_API_KEY;
      else process.env.SCANNER_AI_API_KEY = prevKey;
    }
  };
}

function withoutAiEnv(fn: () => Promise<void> | void) {
  return async () => {
    const prevUrl = process.env.SCANNER_AI_URL;
    const prevKey = process.env.SCANNER_AI_API_KEY;
    delete process.env.SCANNER_AI_URL;
    delete process.env.SCANNER_AI_API_KEY;
    try {
      await fn();
    } finally {
      if (prevUrl !== undefined) process.env.SCANNER_AI_URL = prevUrl;
      if (prevKey !== undefined) process.env.SCANNER_AI_API_KEY = prevKey;
    }
  };
}

test('aiConfigured reflects SCANNER_AI_* env', withoutAiEnv(() => {
  assert.equal(aiConfigured(), false);
}));

test('aiConfigured true when SCANNER_AI_* set', withAiEnv(() => {
  assert.equal(aiConfigured(), true);
}));

test('aiJudgeBatch makes ONE call for all promises of an article', withAiEnv(async () => {
  const calls = { count: 0 };
  const fetcher = mockFetcher(calls, {
    choices: [
      {
        message: {
          content: JSON.stringify({
            judgments: [
              { lineage: 'mainnet', relevant: true, stance: 'supports', reasoning: 'headline is the launch', assessment: 'fulfilled' },
              { lineage: 'staking', relevant: false, stance: 'context', reasoning: 'unrelated', assessment: null },
            ],
          }),
        },
      },
    ],
  });
  const out = await aiJudgeBatch(ARTICLE, PROMISES, fetcher);
  assert.equal(calls.count, 1, 'one model call per article, not per pair');
  assert.equal(out.get('mainnet')?.relevant, true);
  assert.equal(out.get('mainnet')?.assessment, 'fulfilled');
  assert.equal(out.get('staking')?.relevant, false);
}));

test('aiJudgeBatch returns an empty map when AI is unconfigured', withoutAiEnv(async () => {
  const calls = { count: 0 };
  const out = await aiJudgeBatch(ARTICLE, PROMISES, mockFetcher(calls, {}));
  assert.equal(calls.count, 0);
  assert.equal(out.size, 0);
}));

test('aiJudgeBatch returns an empty map on malformed model output', withAiEnv(async () => {
  const calls = { count: 0 };
  const fetcher = mockFetcher(calls, { choices: [{ message: { content: '{"nope": true}' } }] });
  const out = await aiJudgeBatch(ARTICLE, PROMISES, fetcher);
  assert.equal(out.size, 0, 'caller keeps the rule decision on AI failure');
}));

test('aiJudge (single) still works via the batch path', withAiEnv(async () => {
  const calls = { count: 0 };
  const fetcher = mockFetcher(calls, {
    choices: [
      {
        message: {
          content: JSON.stringify({
            judgments: [{ lineage: 'mainnet', relevant: true, stance: 'supports', reasoning: 'r', assessment: null }],
          }),
        },
      },
    ],
  });
  const j = await aiJudge(ARTICLE, PROMISES[0], fetcher);
  assert.equal(j?.relevant, true);
  assert.equal(calls.count, 1);
}));

test('matchLineage exposes keyword hit counts', () => {
  const promise = { lineage: 'x', criteria: 'Ship the decentralized oracle mainnet upgrade' };
  const hit = matchLineage(ARTICLE, promise, ['chainlink', 'link']);
  assert.equal(hit.matched, true);
  assert.ok(hit.hits >= 2, 'hits feed the AI-gating signal');
  const weak = matchLineage(
    { url: 'u', title: 'Oracle network faces questions', publisher: 'P', published_at: '2026-01-01T00:00:00Z' },
    promise,
    ['chainlink', 'link'],
  );
  assert.equal(weak.matched, false);
  assert.ok(weak.hits >= 1 && weak.hits < 2, 'weak signal still gates an AI call');
  const none = matchLineage(
    { url: 'u', title: 'Bitcoin price rallies on ETF flows', publisher: 'P', published_at: '2026-01-01T00:00:00Z' },
    promise,
  );
  assert.equal(none.hits, 0, 'zero-signal articles skip the model entirely');
});

test(
  'runPromiseNewsScan with requireAi throws before any DB access when AI is unconfigured',
  withoutAiEnv(async () => {
    const db = {} as never;
    await assert.rejects(
      () => runPromiseNewsScan(db, false, { requireAi: true, persistRunFile: false }),
      /SCANNER_AI_URL \/ SCANNER_AI_API_KEY/,
    );
  }),
);
