import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNewsFeed, newsFeedUrl, fetchNewsMentions } from '../src/lib/news-mentions';
import { dailyMentions, publisherCounts } from '../src/lib/hype-mentions';
const now = new Date('2026-09-26T12:00:00Z');
const item = (url: string, date: string, source = 'Example') => `<item><title>Real &amp; useful - ${source}</title><link>${url}</link><pubDate>${date}</pubDate><source url="https://example.com">${source}</source></item>`;
const wrap = (items: string) => `<rss><channel><pubDate>Sat, 26 Sep 2026 12:00:00 GMT</pubDate>${items}</channel></rss>`;
test('counts real items, decodes text, deduplicates, excludes invalid and out of window records', () => {
 const feed = parseNewsFeed(wrap(item('https://example.com/a', now.toISOString()) + item('https://example.com/a', now.toISOString()) + item('javascript:alert(1)', now.toISOString()) + item('https://example.com/old','2026-09-18') + item('https://example.com/future','2026-09-27') + item('https://example.com/b','2026-09-19T12:00:00Z','Other')), 'btc', now);
 assert.equal(feed.articles.length, 2);
 assert.equal(feed.articles[0].title, 'Real & useful');
 assert.deepEqual(publisherCounts(feed.articles), [{name:'Example',count:1},{name:'Other',count:1}]);
 assert.equal(dailyMentions(feed).reduce((s,d) => s+d.count,0),2);
 assert.equal(dailyMentions(feed,'Other').reduce((s,d) => s+d.count,0),1);
 assert.equal(dailyMentions(feed).length,8);
});
test('rejects unsupported projects, HTML errors, entities; keeps valid empty feed', () => {
 assert.throws(() => newsFeedUrl('__proto__'));
 assert.throws(() => parseNewsFeed('<html>blocked</html>','btc',now));
 assert.throws(() => parseNewsFeed('<!DOCTYPE rss>'+wrap(''),'btc',now));
 assert.equal(parseNewsFeed(wrap(''),'btc',now).articles.length,0);
});
test('provider failure does not become zero coverage', async () => {
 await assert.rejects(fetchNewsMentions('btc', (async () => new Response('',{status:429})) as typeof fetch));
});
