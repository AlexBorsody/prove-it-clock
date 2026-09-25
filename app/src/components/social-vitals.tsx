"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  fmtSocial,
  hypeVerdict,
  trendOf,
  type HypeVerdict,
  type SocialSnapshot,
  type Trend,
} from "@/lib/social";
import {
  MegaphoneIcon,
  RedditIcon,
  TelegramIcon,
  FlameIcon,
  ShieldCheckIcon,
  InfoIcon,
} from "@/components/icons";

/**
 * Social subsection of the Vitals panel: Prove-It's own social data,
 * framed through the accountability lens. HYPE (social volume) sits next
 * to SUBSTANCE (hearts earned): massive buzz with few hearts reads as
 * all sizzle, no steak. Display only, never scored.
 */

interface SocialPayload {
  status: string;
  latest?: SocialSnapshot;
  previous?: SocialSnapshot | null;
  median_mentions_7d?: number | null;
  batch_size?: number;
}

function TrendArrow({ trend }: { trend: Trend }) {
  if (!trend || trend === "flat") return null;
  return (
    <span className="social-trend" aria-label={trend === "up" ? "trending up" : "trending down"}>
      {trend === "up" ? "▲" : "▼"}
    </span>
  );
}

function Metric({
  icon,
  label,
  value,
  previous,
}: {
  icon: ReactNode;
  label: string;
  value: number | null;
  previous: number | null;
}) {
  if (value == null) return null;
  return (
    <div className="vital-tile">
      <div className="vital-icon">{icon}</div>
      <div className="vital-num num">
        {fmtSocial(value)}
        <TrendArrow trend={trendOf(value, previous)} />
      </div>
      <div className="vital-label">{label}</div>
    </div>
  );
}

function VerdictIcon({ tone }: { tone: HypeVerdict["tone"] }) {
  if (tone === "sizzle") return <FlameIcon className="hype-verdict-icon" />;
  if (tone === "proven") return <ShieldCheckIcon className="hype-verdict-icon" />;
  return <InfoIcon className="hype-verdict-icon" />;
}

export default function SocialVitals({
  slug,
  earned,
  capacity,
}: {
  slug: string;
  earned: number;
  capacity: number;
}) {
  const [payload, setPayload] = useState<SocialPayload | null>(null);

  useEffect(() => {
    let live = true;
    fetch(`/api/social/${slug}`)
      .then((r) => (r.ok ? r.json() : { status: "no_data" }))
      .then((d: SocialPayload) => {
        if (live) setPayload(d);
      })
      .catch(() => {
        if (live) setPayload({ status: "no_data" });
      });
    return () => {
      live = false;
    };
  }, [slug]);

  // No snapshots yet (migration not applied, or collector hasn't run):
  // hide the whole section. Never show fake or empty numbers.
  if (!payload || payload.status !== "ok" || !payload.latest) return null;

  const latest = payload.latest;
  const prev = payload.previous ?? null;
  const verdict: HypeVerdict = hypeVerdict(
    latest.news_mentions_7d,
    payload.median_mentions_7d ?? null,
    payload.batch_size ?? 0,
    earned,
    capacity
  );

  const toneClass =
    verdict.tone === "sizzle"
      ? "sev-bad"
      : verdict.tone === "proven"
        ? "sev-ok"
        : "sev-neutral";

  return (
    <div className="social-section">
      <h3 className="social-heading">
        <MegaphoneIcon className="social-heading-icon" />
        Social
      </h3>
      <p className="panel-sub">
        Our own collector: Reddit, Telegram, and news feeds, snapshotted
        daily. Display only: it does not affect the hearts score.
      </p>

      <div className="vitals-grid">
        <Metric
          icon={<MegaphoneIcon />}
          label="News mentions, 7d"
          value={latest.news_mentions_7d}
          previous={prev?.news_mentions_7d ?? null}
        />
        <Metric
          icon={<RedditIcon />}
          label="Reddit subscribers"
          value={latest.reddit_subscribers}
          previous={prev?.reddit_subscribers ?? null}
        />
        <Metric
          icon={<TelegramIcon />}
          label="Telegram members"
          value={latest.telegram_members}
          previous={prev?.telegram_members ?? null}
        />
      </div>

      <div className={`hype-verdict ${toneClass}`}>
        <div className="hype-verdict-kicker">Hype vs substance</div>
        <p className="hype-verdict-read">
          <VerdictIcon tone={verdict.tone} />
          {verdict.read}
        </p>
        <p className="hype-verdict-sub">
          {verdict.buzz ? `Buzz running ${verdict.buzz} vs tracked projects. ` : ""}
          {earned} of {capacity} hearts earned, on the record.
        </p>
      </div>
    </div>
  );
}
