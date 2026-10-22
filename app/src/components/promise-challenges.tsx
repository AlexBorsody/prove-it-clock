"use client";
import Link from 'next/link';

/**
 * Per-promise challenge threads.
 * Source-backed contributions use stable project and promise lineage IDs.
 */

export default function PromiseChallenges({
  projectSlug,
  lineage,
  open,
  onToggle,
}: {
  projectSlug: string;
  lineage?: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="promise-challenges">
      <button
        type="button"
        className="challenge-toggle"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className="challenge-chev" aria-hidden="true">{open ? "▼" : "▶"}</span>
        Add evidence or challenge this assessment
      </button>
      {open && (
        <div className="challenge-thread">
          <p className="dim">Have a source we missed? Submit it for review. Community submissions do not automatically change this assessment.</p>
          {lineage ? <p style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <Link href={`/community?${new URLSearchParams({ project: projectSlug, promise: lineage, kind: 'evidence' })}`}>Add evidence →</Link>
            <Link href={`/community?${new URLSearchParams({ project: projectSlug, promise: lineage, kind: 'challenge' })}`}>Challenge with a source →</Link>
          </p> : <p className="dim">This record does not have a stable promise reference yet.</p>}
        </div>
      )}
    </div>
  );
}
