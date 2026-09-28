import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';

export type FeedbackKind = 'request' | 'vote';
export const TOKEN_TTL = 600_000;
export const UUID = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;

/** Canonical IP identity. IPv6 rotations inside one /64 share a vote limit. */
export function networkIdentity(raw: string): string {
  const ip = raw.trim();
  if (isIP(ip) === 4) return ip;
  if (isIP(ip) !== 6) throw Error('No trusted client address');
  const canonical = new URL(`http://[${ip}]/`).hostname.slice(1,-1);
  const [left,right=''] = canonical.split('::');
  const a=left ? left.split(':') : [], b=right ? right.split(':') : [];
  const parts=canonical.includes('::') ? [...a,...Array(8-a.length-b.length).fill('0'),...b] : a;
  const words=parts.map(p=>parseInt(p,16));
  if(words.slice(0,5).every(w=>w===0) && words[5]===65535) {
    return [words[6]>>8,words[6]&255,words[7]>>8,words[7]&255].join('.');
  }
  return words.slice(0,4).map(w=>w.toString(16)).join(':')+'::/64';
}
export function clientNetwork(request: Request): string {
  // Vercel overwrites this header. Never trust arbitrary forwarded headers on other hosts.
  if (process.env.VERCEL === '1') return networkIdentity(request.headers.get('x-vercel-forwarded-for') ?? '');
  if (process.env.NODE_ENV !== 'production') return '127.0.0.1';
  throw Error('Feedback needs a trusted proxy');
}
function secret(): string {
  const key=process.env.FEEDBACK_TOKEN_SECRET;
  if(!key || key.length<32) throw Error('Feedback signing is not configured');
  return key;
}
export function privateHash(kind:string,value:string):string {
  return createHmac('sha256',secret()).update(`${kind}:${value}`).digest('hex');
}
export function issueToken(kind:FeedbackKind,network:string,now=Date.now()) {
  const claim={kind,nonce:randomUUID(),issued:now,ip:privateHash('ip',network)};
  const payload=Buffer.from(JSON.stringify(claim)).toString('base64url');
  const signature=createHmac('sha256',secret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}
export function verifyToken(token:unknown,kind:FeedbackKind,network:string,now=Date.now()) {
  if(typeof token!=='string' || token.length>1000) throw Error('Reload the form and try again.');
  const [payload,signature,...extra]=token.split('.');
  const expected=createHmac('sha256',secret()).update(payload).digest();
  const actual=Buffer.from(signature??'','base64url');
  if(extra.length || actual.length!==expected.length || !timingSafeEqual(actual,expected)) throw Error('Reload the form and try again.');
  const claim=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));
  if(claim.kind!==kind || !UUID.test(claim.nonce) || claim.ip!==privateHash('ip',network)
    || !Number.isSafeInteger(claim.issued) || now<claim.issued || now-claim.issued>TOKEN_TTL) throw Error('Reload the form and try again.');
  return {...claim,elapsed:now-claim.issued} as {kind:FeedbackKind;nonce:string;issued:number;ip:string;elapsed:number};
}
export function sameOrigin(request:Request):boolean {
  try {
    const origin = new URL(request.headers.get('origin') ?? '');
    // Next can use an internal localhost URL behind its proxy; Host is the
    // browser's destination and cannot be overridden by cross-origin JavaScript.
    const host = request.headers.get('host') ?? new URL(request.url).host;
    const protocol = process.env.NODE_ENV === 'production' ? 'https:' : new URL(request.url).protocol;
    return origin.host === host && origin.protocol === protocol && origin.origin === request.headers.get('origin');
  } catch { return false; }
}
export interface FeatureInput { title:string;body:string;why:string;website:string }
export function parseFeature(input:Record<string,unknown>):FeatureInput {
  const field=(key:string,min:number,max:number)=>{
    const value=input[key];
    if(typeof value!=='string' || value.trim().length<min || value.trim().length>max) throw Error(`Check the ${key==='body'?'description':key} field.`);
    return value.trim();
  };
  return {title:field('title',3,120),body:field('body',10,4000),why:field('why',0,1500),website:field('website',0,200)};
}
