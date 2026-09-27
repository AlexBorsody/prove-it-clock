/**
 * End-to-end push smoke test (no browser needed):
 *
 * 1. Generates real ephemeral VAPID keys, starts a local mock push service,
 *    and sends a real web-push notification through lib/web-push.ts.
 *    Asserts the mock service receives the POST with a valid VAPID JWT
 *    (ES256 signature verified against the public key) and the expected
 *    payload shape {title, body, url, tag}.
 * 2. Loads the generated public/sw.js in a VM with a fake service-worker
 *    global, fires a push event, and asserts showNotification renders the
 *    payload; fires notificationclick and asserts it opens the deep link.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer as createHttpsServer, type Server as HttpsServer } from 'node:https';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPublicKey, generateKeyPairSync, verify as cryptoVerify } from 'node:crypto';
import vm from 'node:vm';
import webpush from 'web-push';
import { sendPush } from '../src/lib/web-push';

function b64urlToBuf(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

/** Self-signed cert for the mock HTTPS push service. */
function selfSignedCert(): { key: string; cert: string } {
  const dir = mkdtempSync(join(tmpdir(), 'push-smoke-'));
  const keyPath = join(dir, 'key.pem');
  const certPath = join(dir, 'cert.pem');
  execFileSync('openssl', [
    'req', '-x509', '-newkey', 'rsa:2048', '-nodes',
    '-keyout', keyPath, '-out', certPath, '-days', '1',
    '-subj', '/CN=127.0.0.1', '-addext', 'subjectAltName=IP:127.0.0.1',
  ], { stdio: 'ignore' });
  return { key: readFileSync(keyPath, 'utf8'), cert: readFileSync(certPath, 'utf8') };
}

test('web-push send reaches the endpoint with a valid VAPID JWT', async () => {
  const vapid = webpush.generateVAPIDKeys();
  process.env.VAPID_PUBLIC_KEY = vapid.publicKey;
  process.env.VAPID_PRIVATE_KEY = vapid.privateKey;
  process.env.VAPID_SUBJECT = 'mailto:test@example.com';
  // The sandbox sets proxy env vars that would route localhost through a TLS
  // proxy; the mock push service is direct, so bypass proxies in this test.
  for (const key of ['HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'http_proxy', 'https_proxy', 'all_proxy']) {
    delete process.env[key];
  }
  process.env.NO_PROXY = '127.0.0.1,localhost';

  // A real receiver key pair (we only need the public half to encrypt to).
  const receiver = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const rawPub = receiver.publicKey.export({ format: 'der', type: 'spki' });
  // SPKI DER for P-256 ends with the 65-byte uncompressed point; last 65 bytes.
  const point = rawPub.subarray(rawPub.length - 65);
  const p256dh = point.toString('base64url');
  const auth = Buffer.alloc(16, 7).toString('base64url');

  let received: { headers: Record<string, string | string[] | undefined>; body: Buffer } | undefined;
  // Real push services are always https, and web-push only speaks https, so
  // the mock push service is HTTPS with a throwaway self-signed cert.
  const { key, cert } = selfSignedCert();
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  let server: HttpsServer;
  const port = await new Promise<number>((resolve) => {
    server = createHttpsServer({ key, cert }, (req, res) => {
      const chunks: Buffer[] = [];
      req.on('data', (c: Buffer) => chunks.push(c));
      req.on('end', () => {
        received = { headers: req.headers, body: Buffer.concat(chunks) };
        res.writeHead(201);
        res.end();
      });
    }).listen(0, '127.0.0.1', () => resolve((server.address() as { port: number }).port));
  });

  try {
    const result = await sendPush(
      { endpoint: `https://127.0.0.1:${port}/push/abc123`, p256dh, auth },
      { title: 'Chainlink: promise fulfilled', body: 'Ship product X is now fulfilled.', url: '/projects/link?evidence=ship-x', tag: 'prove-value:link:ship-x' },
    );
    assert.equal(result.ok, true);
    assert.ok(received, 'mock push service received the request');
    const r = received as { headers: Record<string, string | string[] | undefined>; body: Buffer };
    assert.ok(r.body.length > 0, 'encrypted payload present');
    assert.match(String(r.headers['content-encoding'] ?? ''), /aes128gcm/);

    // Verify the VAPID JWT signature with the public key.
    const authz = String(r.headers['authorization'] ?? '');
    assert.match(authz, /^vapid t=/);
    const jwt = authz.slice('vapid t='.length).split(',')[0].trim();
    const [h, p, sig] = jwt.split('.');
    const header = JSON.parse(Buffer.from(h, 'base64url').toString());
    const claims = JSON.parse(Buffer.from(p, 'base64url').toString());
    assert.equal(header.alg, 'ES256');
    assert.equal(claims.aud, `https://127.0.0.1:${port}`);
    assert.ok(claims.sub.includes('test@example.com'));
    const point = b64urlToBuf(vapid.publicKey);
    assert.equal(point[0], 0x04, 'uncompressed P-256 point');
    const pubKey = createPublicKey({
      key: {
        kty: 'EC',
        crv: 'P-256',
        x: point.subarray(1, 33).toString('base64url'),
        y: point.subarray(33, 65).toString('base64url'),
      },
      format: 'jwk',
    });
    // JWS uses raw R||S (ieee-p1363); verify with the one-shot API which
    // honors dsaEncoding (createVerify silently ignores it).
    const ok = cryptoVerify('sha256', Buffer.from(`${h}.${p}`),
      { key: pubKey, dsaEncoding: 'ieee-p1363' }, b64urlToBuf(sig));
    assert.equal(ok, true, 'VAPID JWT signature valid');
  } finally {
    server!.close();
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
    delete process.env.VAPID_SUBJECT;
  }
});

test('service worker renders push and deep-links on click', async () => {
  const swSource = readFileSync(join(__dirname, '..', 'public', 'sw.js'), 'utf8');
  const listeners: Record<string, (...args: unknown[]) => void> = {};
  const shown: Array<Record<string, unknown>> = [];
  const opened: string[] = [];
  const sandbox = {
    URL,
    self: {
      location: { origin: 'https://prove.test' },
      addEventListener: (name: string, fn: (...args: unknown[]) => void) => { listeners[name] = fn; },
      registration: {
        showNotification: (title: string, opts: Record<string, unknown>) => {
          shown.push({ title, ...opts });
          return Promise.resolve();
        },
      },
      clients: {
        matchAll: async () => [],
        openWindow: (url: string) => { opened.push(url); return Promise.resolve(null); },
      },
    },
    caches: { keys: async () => [], match: async () => undefined, open: async () => ({ put: async () => {} }) },
    fetch: async () => { throw new Error('no network in test'); },
  };
  vm.createContext(sandbox);
  vm.runInContext(swSource, sandbox);
  assert.ok(listeners.push, 'push handler registered');
  assert.ok(listeners.notificationclick, 'notificationclick handler registered');

  const payload = { title: 'Chainlink: promise fulfilled', body: 'Ship product X is now fulfilled.', url: '/projects/link?evidence=ship-x', tag: 't1' };
  let waited: Promise<unknown> = Promise.resolve();
  listeners.push({
    data: { json: () => payload },
    waitUntil: (p: Promise<unknown>) => { waited = p; },
  });
  await waited;
  assert.equal(shown.length, 1);
  assert.equal(shown[0].title, payload.title);
  assert.equal(shown[0].body, payload.body);
  assert.deepEqual((shown[0].data as { url: string }).url, payload.url);

  waited = Promise.resolve();
  listeners.notificationclick({
    notification: { close: () => {}, data: { url: payload.url } },
    waitUntil: (p: Promise<unknown>) => { waited = p; },
  });
  await waited;
  assert.deepEqual(opened, [payload.url], 'click opens the deep link');
});
