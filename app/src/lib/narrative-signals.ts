/**
 * Narrative vs substance signals (Alex, 2026-09-27, locked).
 *
 * Not every promise sells the same thing. Substance promises say the tech
 * will become useful. Narrative promises say the token will go up.
 * NFT mentions, token burns, and max supply mechanics are strong narrative
 * signals. This flags them in ledger context only. It never changes
 * scoring: a heart is still earned only by delivery.
 */

export type NarrativeSignal = "nft" | "burn" | "max-supply";

const SIGNAL_PATTERNS: { signal: NarrativeSignal; label: string; pattern: RegExp }[] = [
  { signal: "nft", label: "NFT mention", pattern: /\bnfts?\b/i },
  { signal: "burn", label: "Token burn", pattern: /\bburn(s|ed|ing)?\b/i },
  {
    signal: "max-supply",
    label: "Supply mechanics",
    pattern: /\bmax[ -]?supply\b|\bfixed supply\b|\bhard cap\b|\bdeflationary\b/i,
  },
];

const SIGNAL_TOOLTIP: Record<NarrativeSignal, string> = {
  nft: "Narrative signal: this promise leans on NFT story rather than delivered utility. It still earns its heart only by delivery.",
  burn: "Narrative signal: this promise leans on token burn mechanics rather than delivered utility. It still earns its heart only by delivery.",
  "max-supply":
    "Narrative signal: this promise leans on supply mechanics rather than delivered utility. It still earns its heart only by delivery.",
};

export function signalLabel(signal: NarrativeSignal): string {
  return SIGNAL_PATTERNS.find((p) => p.signal === signal)?.label ?? signal;
}

export function signalTooltip(signal: NarrativeSignal): string {
  return SIGNAL_TOOLTIP[signal];
}

/** Returns the narrative signals detected in a promise's text. Empty when none. */
export function detectNarrativeSignals(pr: {
  criteria?: string | null;
  rationale?: string | null;
}): NarrativeSignal[] {
  const text = `${pr.criteria ?? ""}\n${pr.rationale ?? ""}`;
  if (!text.trim()) return [];
  return SIGNAL_PATTERNS.filter((p) => p.pattern.test(text)).map((p) => p.signal);
}
