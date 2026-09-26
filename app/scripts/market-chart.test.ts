import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCandles, nearestCandle } from '../src/lib/market-chart';

test('OHLC data is ordered and invalid prices cannot enter the chart', () => {
 const result = parseCandles([[300,12,14,10,13],[100,10,12,9,11],[200,11,10,9,12],[400,1,2,0,1],[500,1,Infinity,1,1]]);
 assert.deepEqual(result.map(c => c.t),[100,300]);
 assert.throws(() => parseCandles({error:'rate limited'}));
 assert.throws(() => parseCandles([[100,0,0,0,0]]));
});
test('scrubbing selects the nearest real timestamp and clamps either end', () => {
 const rows = parseCandles([[100,10,12,9,11],[300,12,14,10,13],[900,13,15,12,14]]);
 assert.equal(nearestCandle(rows,0),0);
 assert.equal(nearestCandle(rows,290),1);
 assert.equal(nearestCandle(rows,601),2);
 assert.equal(nearestCandle(rows,9999),2);
});
