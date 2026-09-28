import Link from "next/link";
import { CATEGORIES, type CategoryId } from "../../data/atlas-taxonomy";
import { deliveryReceipt, type DeliverySummary } from "@/lib/promise-verdict";
import HeartMeter from "./heart-meter";
import styles from "./promise-category-meters.module.css";

// Subject colors, never outcome grades. Filled/empty hearts retain their meaning.
const COLORS: Record<CategoryId, string> = {
  money: "#91b5ff", payments: "#c4a2ff", platform: "#88c9ed", defi: "#d8b0df",
  privacy: "#b9b3ef", interoperability: "#a8c1dd", governance: "#d9bc9c",
  "real-world": "#bebee9", unclassified: "#a6adbb",
};

/** The aggregate's same primary-assignment population, split by subject. */
export default function PromiseCategoryMeters({ slug, summary }: {
  slug: string;
  summary: DeliverySummary;
}) {
  return <ul className={styles.categories} aria-label="Promises by category">
    {CATEGORIES.filter(category => summary.categories[category.id].total > 0).map(category => {
      const counts = summary.categories[category.id];
      return <li key={category.id}>
        <Link href={deliveryReceipt(slug, category.id)} className={styles.category}
          aria-label={`${category.label}: ${counts.kept} of ${counts.total} promises kept. View promises on the Atlas`}>
          <span className={styles.label}>{category.label} <span aria-hidden="true">↗</span></span>
          <HeartMeter filled={counts.kept} capacity={counts.total} size={18} color={COLORS[category.id]} />
        </Link>
      </li>;
    })}
  </ul>;
}
