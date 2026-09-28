# Tip + Feature Request Page — brief for Codex

Date: 2026-09-27. Submitted to Codex's task queue: 2026-09-28.
Status: implemented on `codex/support-feedback`; production activation pending.

## Current decision (Alex, September 28)

Feedback posts immediately as anonymous public comments that visitors can upvote.
No email delivery, notifications, contact fields, account or mail setup. This supersedes
private-first intake and email requirements below. Use IP restrictions and rate limits
for now; advanced fingerprinting, proof-of-work and CAPTCHA are deferred.
Donation addresses, QR codes and tallies remain deferred to Alex.

## Delivery checklist

- [x] `/support`: idea title, details, optional reason; public comment board.
- [x] Anonymous voting across different ideas, once per idea per IP or IPv6 /64.
- [x] Durable database limits: five posts/day, thirty new votes/hour per network;
  a ceiling of one hundred attempts/minute. Signed expiring actions and honeypot.
- [x] Comments rendered as text. Network hashes stay private. Operators can hide abuse.
- [x] Remove email and contact collection from this scope.
- [x] Site footer entry point when enabled; no extra bottom tab.
- [ ] Apply migration 011 on the confirmed production target with direct authorization.
- [ ] Configure signing secret, enable feedback, and verify published-page submissions/votes.
- [ ] Donation block: deferred until Alex supplies addresses.

Codex owns the form, API, migration and checks. Muse: preserve the immediate-public,
no-email decision when editing this page. Deployment instructions and verification
are in [support-feedback.md](../support-feedback.md).

## Original brief (superseded where noted above)

## Concept
One page (suggested route `/support`) with two parts:
1. **Feature request form** (the hero): "got a feature you want? Tell me — tip if you want it built faster."
2. **Tip block**: QR code per currency, each with a live on-chain tally.

Positioning: tips are a *signal*, never a purchase. Alex builds whatever he wants. No paywall framing anywhere.

## Tip block — DEFERRED (Alex, 2026-09-28)
Do not build this yet. Alex is handling QR codes / addresses himself and
will bring them later. The feature-request form ships without it. The spec
below is kept for when he returns with the addresses.
- Launch currency set: BTC, ETH, LTC, XMR, SOL, USDC (Ethereum), DASH, BAT, AVAX, LINK. Alex trims/extends.
- Each currency card: QR code (generated from address, never fetched "from Bitcoin" anywhere), address with copy button, live tally "N tips · X received".
- Tallies are automatic via block explorer APIs (Blockchair for BTC/LTC/DASH, Etherscan-family for ETH + ERC-20s, etc.), cached server-side. No manual counting. The proof is the chain.
- **BLOCKER (Alex-only):** fresh receive address per currency from his own wallets. Must be NEW addresses, never his main wallets — holdings stay private, tip jars stay public.

## Feature request form
- Fields: feature title, description, why it matters, name/email (optional).
- Submits to Supabase table `feature_requests` (title, body, why, name, email, created_at, status, public boolean default false, upvotes int default 0, user_id uuid NULLABLE — reserved for future auth, do not build auth now) + email notification to Alex.
- Alex moderates: flips `public=true` on requests he likes. Public board on the same page lists public ones with an upvote button (rate-limited, one vote per IP/fingerprint).
- Spam: honeypot + rate limiting for now. Real CAPTCHA only if abused.
- Upvote anti-gaming (layered, risk-based — log signals from day one, enforce harder as abuse appears):
  1. IP dedup: one vote per IP per request; group IPv6 by /64 (mobile carriers rotate addresses).
  2. Browser fingerprinting (FingerprintJS-style) as a second identity signal.
  3. Signed vote tokens: server issues a short-lived nonce per page load; votes without a valid token are rejected (kills replay bots).
  4. Client-side proof-of-work per vote: trivial for a human, expensive at scale.
  5. Honeypot + timing analysis on the request form (filled in under ~2s = bot).
  6. Risk-based escalation: suspicious votes get a Cloudflare Turnstile challenge instead of counting.
  7. Velocity anomaly detection: e.g. 100 votes in 60s from one subnet auto-flags for review.
  8. Cookie/localStorage voter ID as a soft signal, never a hard gate.

## Copy
Playful, terse. Draft headline: "Tip in your favorite currency. Just make sure it's not a shitcoin." No em dashes anywhere (standing rule). No timestamps, no count labels on the page chrome.

## Out of scope
- No per-request tipping ("fund this feature") — tips go to Alex, requests are separate.
- No public comments thread on requests — upvotes only.
- No wallet-connect / on-site payment flow — QR + address only.
