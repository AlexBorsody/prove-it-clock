# Interactive market chart

Codex, scoped to the shared market panel after pulling Muse's modular refactor (2b73ad8).

- Line/area chart defaults to one week; 1D/1W/1M and optional candles.
- Mouse/finger scrubbing, crosshair, price/date/change readout, keyboard arrows/Home/End.
- One reusable MarketChart renders inline and inside the expanded native dialog.
- Compact controls, responsive date ticks, native focus containment and Escape/Close/backdrop dismissal.
- Existing CoinGecko OHLC feed; no new package, DB changes or scoring changes.
- Per-project/range 15-minute in-memory cache. Stale requests aborted; invalid OHLC rejected;
  errors stay visible with retry. Spot quote is separate from sampled historical close.
- Range changes use the first and last plotted close, not a fabricated live return.

Checks: focused OHLC validation/nearest-time tests passed. Browser with real Bitcoin feeds:
1D, 1W and 1M loaded; keyboard and drag scrub updated values; candle OHLC changed;
expanded dialog closed with Escape and restored focus. Checked 390px and 320px widths,
including chart label collision fix. Temporary preview route removed before commit.
Production build passed; no preview route ships. Deployment verification follows push.

Provider reference: [CoinGecko OHLC guide](https://www.coingecko.com/learn/download-crypto-ohlcv-data).
No new external provider integrations. Physical touchscreen acceptance remains a useful manual check:
open a project, drag horizontally across Market, then swipe vertically to continue down the page.
