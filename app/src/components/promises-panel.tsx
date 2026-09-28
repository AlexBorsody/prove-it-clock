"use client";

/**
 * Promises panel: heading, heart meter, category filter, and the promise
 * list. The category dropdown filters the hearts AND the list below, so the
 * two always agree. (Alex 2026-09-28)
 */
import { useState } from "react";
import Link from "next/link";
import HeartMeter from "@/components/heart-meter";
import InfoTip from "@/components/info-tip";
import DeliveryComposition from "@/components/delivery-composition";
import PromiseList from "@/components/promise-list";
import { normalizePromiseState } from "@/lib/hearts";
import { projectFlags } from "@/lib/project-policy";
import {
  promiseFilterHref,
  matchesPromiseFilter,
  type PromiseFilter,
} from "@/lib/promise-context";
import type { CategoryId } from "../../data/atlas-taxonomy";
import type { DeliverySummary } from "@/lib/promise-verdict";
import type { ReceiptRevision } from "@/lib/promise-receipts";

export default function PromisesPanel({
  slug,
  name,
  promises,
  filter,
  evidence,
  summary,
  revision,
  categoryByLineage,
}: {
  slug: string;
  name: string;
  promises: any[];
  filter: PromiseFilter;
  evidence?: string;
  summary: DeliverySummary | null;
  revision: ReceiptRevision | null;
  categoryByLineage: Record<string, CategoryId | null>;
}) {
  const [category, setCategory] = useState<CategoryId | "">("");
  const categoryOf = (pr: any): CategoryId =>
    (categoryByLineage[String(pr.lineage ?? "")] ?? "unclassified") as CategoryId;

  const visible = promises.filter(
    (pr) =>
      matchesPromiseFilter(pr.state, filter) &&
      (!category || categoryOf(pr) === category),
  );
  let filled = 0;
  for (const pr of visible) {
    try {
      if (normalizePromiseState(pr.state) === "fulfilled") filled++;
    } catch {
      /* unknown state earns nothing */
    }
  }

  return (
    <>
      <h2>
        <span>Promises</span>{" "}
        <InfoTip
          text={`What ${name} promised, and what actually happened. One promise, one heart: earned by delivery. Open hearts are still unearned. Each promise counts once. Select a count to inspect its published evidence.`}
        />
      </h2>
      <div style={{ margin: "4px 0 14px" }}>
        <HeartMeter filled={filled} capacity={visible.length} size={34} genesis={projectFlags(slug).genesis} />
      </div>
      {summary && revision && (
        <DeliveryComposition
          slug={slug}
          summary={summary}
          revision={revision}
          category={category}
          onCategory={setCategory}
        />
      )}
      {filter !== "all" && (
        <p className="promise-filter-status" role="status">
          {(() => {
            const n = promises.filter((pr) =>
              matchesPromiseFilter(pr.state, filter),
            ).length;
            const label =
              filter === "in-play" ? "active" : filter.replace("-", " ");
            const showAll = (
              <Link href={promiseFilterHref(slug, "all")}>
                Show all promises
              </Link>
            );
            return n === 0 ? (
              <>
                No {label} promises yet. {showAll}
              </>
            ) : (
              showAll
            );
          })()}
        </p>
      )}
      <PromiseList
        key={`${filter}-${category}`}
        slug={slug}
        name={name}
        promises={promises}
        filter={filter}
        evidence={evidence}
        category={category}
        categoryOf={categoryOf}
      />
    </>
  );
}
