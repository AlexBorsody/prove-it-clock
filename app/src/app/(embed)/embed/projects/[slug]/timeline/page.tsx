/**
 * GET/embed page: /embed/projects/[slug]/timeline
 *
 * Server-rendered, JavaScript-free embeddable score timeline. Reuses the same
 * pure-SVG renderer as the project pages (`@/components/timeline-svg`), so the
 * widget and the site can never disagree.
 *
 * Query params:
 *   theme  light | dark   (default: light — most host pages are light)
 *   w      render width px (default 680, clamped 320–1200)
 *   h      suggested iframe height px (default 340); content is vertically
 *          centered when the frame is taller than the content
 *
 * Headers: X-Frame-Options is stripped for /embed/* in middleware.
 * Cache: history reads go through the shared 5-minute cache in @/lib/history.
 *
 * Hard rules:
 * - Methodology v0.2.0 only; v0.3.0 rows are excluded at the fetch layer.
 * - Unscored projects render the explicit unavailable state — never an empty
 *   chart, never zeros.
 * - No scoring logic here; this page only renders.
 */
import { notFound } from "next/navigation";
import { supabaseEnabled } from "@/lib/supabase";
import { getProjectHistory } from "@/lib/history";
import { ACTIVE_METHODOLOGY_VERSION } from "@/lib/active-methodology";
import { CHART_DEFAULT_SERIES } from "@/lib/ranking-factors";
import TimelineSvg, {
  DARK_PALETTE,
  LIGHT_PALETTE,
  type TimelinePalette,
} from "@/components/timeline-svg";

export const dynamic = "force-dynamic";

const SANS =
  '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif';
const MONO = '"SFMono-Regular", ui-monospace, "Cascadia Mono", Menlo, Consolas, monospace';

const clampInt = (raw: string | undefined, fallback: number, min: number, max: number) => {
  const n = parseInt(raw ?? "", 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

function shell(p: TimelinePalette, w: number, h: number, children: React.ReactNode) {
  return (
    <div
      style={{
        margin: 0,
        background: p.bg,
        color: p.text,
        fontFamily: SANS,
        fontSize: 14,
        lineHeight: 1.5,
        width: w,
        minHeight: h,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 12,
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}

function credit(p: TimelinePalette, slug: string) {
  return (
    <div
      style={{
        marginTop: 10,
        paddingTop: 8,
        borderTop: `1px solid ${p.border}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        fontSize: 12,
        color: p.faint,
      }}
    >
      <span>
        Prove-It · hearts claim-type rule v2
      </span>
      <a href={`/projects/${slug}`} style={{ color: p.accent, textDecoration: "none" }}>
        Full scorecard →
      </a>
    </div>
  );
}

export default async function EmbedTimelinePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ theme?: string; w?: string; h?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const theme = sp.theme === "dark" ? "dark" : "light";
  const p = theme === "dark" ? DARK_PALETTE : LIGHT_PALETTE;
  const w = clampInt(sp.w, 680, 320, 1200);
  const h = clampInt(sp.h, 340, 200, 900);

  if (!supabaseEnabled()) {
    return shell(
      p,
      w,
      h,
      <p style={{ margin: 0, color: p.dim }}>
        Timeline unavailable. History is not configured on this deployment.
      </p>,
    );
  }

  let body: Awaited<ReturnType<typeof getProjectHistory>>;
  try {
    body = await getProjectHistory(slug);
  } catch {
    return shell(
      p,
      w,
      h,
      <p style={{ margin: 0, color: p.dim }}>
        Timeline unavailable. The history request failed.
      </p>,
    );
  }
  if (!body) notFound();

  const scored = Object.values(body.metrics).some((pts) =>
    pts.some((pt) => pt.value != null),
  );

  if (!scored) {
    return shell(
      p,
      w,
      h,
      <>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{body.name}</div>
          <div
            style={{
              marginTop: 4,
              display: "inline-block",
              fontFamily: MONO,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: p.accent,
              border: `1px solid ${p.accent}`,
              borderRadius: 4,
              padding: "2px 8px",
            }}
          >
            NOT SCORED UNDER v{ACTIVE_METHODOLOGY_VERSION}: UNAVAILABLE
          </div>
        </div>
        <TimelineSvg body={body} palette={p} fillBackground />
        {credit(p, slug)}
      </>,
    );
  }

  return shell(
    p,
    w,
    h,
    <>
      <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>
          {body.name} <span style={{ color: p.faint, fontWeight: 400 }}>score history</span>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 12, color: p.faint }}>
          v{ACTIVE_METHODOLOGY_VERSION}
        </div>
      </div>
      <TimelineSvg
        body={body}
        palette={p}
        fillBackground
        hidden={
          new Set(
            Object.keys(body.metrics).filter(
              (c) => !CHART_DEFAULT_SERIES.includes(c),
            ),
          )
        }
      />
      {credit(p, slug)}
    </>,
  );
}
