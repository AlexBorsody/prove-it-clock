# Tip + Feature Request Page — brief for Codex

Date: 2026-09-27. Submitted to Codex's task queue: 2026-09-28.
Status: spec only, NOT built. Blocker unchanged: fresh receive addresses
per currency still needed from Alex (see below).

## Concept
One page (suggested route `/support`) with two parts:
1. **Feature request form** (the hero): "got a feature you want? Tell me — tip if you want it built faster."
2. **Tip block**: QR code per currency, each with a live on-chain tally.

Positioning: tips are a *signal*, never a purchase. Alex builds whatever he wants. No paywall framing anywhere.

## Tip block
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
