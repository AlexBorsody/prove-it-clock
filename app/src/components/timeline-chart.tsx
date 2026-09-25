"use client";

import { useEffect, useRef, useState } from "react";
import { CHART_DEFAULT_SERIES } from "../lib/ranking-factors";
import TimelineSvg, {
  DARK_PALETTE,
  type SvgEvent,
  type TimelineBody,
} from "./timeline-svg";

/**
 * Prove-It timeline — interactive project-page chart.
 *
 * Client wrapper around the shared pure-SVG renderer (`timeline-svg.tsx`):
 * fetches `/api/projects/[slug]/history`, adds legend toggles and the
 * click-for-evidence event panel. The SVG itself is identical to what the
 * embeddable widget renders server-side.
 *
 * Render contract: nulls break the line (gaps, never interpolation or
 * zero-fill); unscored projects render the explicit score-unavailable state.
 */
export default function TimelineChart({ slug }: { slug: string }) {
  const [body, setBody] = useState<TimelineBody | null>(null);
  const [failed, setFailed] = useState(false);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [selectedEvent, setSelectedEvent] = useState<SvgEvent | null>(null);
  const defaultsSet = useRef(false);

  useEffect(() => {
    let live = true;
    fetch(`/api/projects/${slug}/history`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j) => {
        if (live) {
          setBody(j);
          // First load: the main ranking factors lead; everything else is one
          // tap away in the legend. After that the user's toggles rule.
          if (!defaultsSet.current) {
            defaultsSet.current = true;
            const codes = Object.keys(j.metrics ?? {});
            setHidden(
              new Set(codes.filter((c) => !CHART_DEFAULT_SERIES.includes(c))),
            );
          }
        }
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
  }, [slug]);

  const toggle = (code: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  if (failed) {
    return <p className="panel-sub" style={{ margin: 0 }}>Timeline unavailable. History request failed.</p>;
  }
  if (!body) {
    return <p className="panel-sub" style={{ margin: 0 }}>Loading timeline…</p>;
  }

  return (
    <div>
      <TimelineSvg
        body={body}
        palette={DARK_PALETTE}
        hidden={hidden}
        onToggleMetric={toggle}
        selectedEvent={selectedEvent}
        onSelectEvent={setSelectedEvent}
      />

      {selectedEvent && (
        <div className="panel" style={{ marginTop: 12, marginBottom: 0, padding: "12px 14px" }}>
          <div className="num" style={{ color: "var(--text-faint)", fontSize: 13 }}>
            {selectedEvent.date} · {selectedEvent.type.replace(/_/g, " ")}
          </div>
          <div style={{ fontWeight: 700, margin: "4px 0" }}>{selectedEvent.title}</div>
          <p className="panel-sub" style={{ margin: 0 }}>{selectedEvent.evidence_summary}</p>
        </div>
      )}
    </div>
  );
}
