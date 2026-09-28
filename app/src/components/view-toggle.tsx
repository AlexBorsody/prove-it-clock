"use client";

import styles from "./view-toggle.module.css";

export type BoardView = "cards" | "list";

export default function ViewToggle({
  value,
  onChange,
  label = "View",
}: {
  value: BoardView;
  onChange: (v: BoardView) => void;
  label?: string;
}) {
  return (
    <div className={styles.toggle} role="group" aria-label={label}>
      {(["cards", "list"] as BoardView[]).map((v) => (
        <button
          key={v}
          type="button"
          className={value === v ? styles.active : undefined}
          aria-pressed={value === v}
          onClick={() => onChange(v)}
        >
          {v === "cards" ? "Cards" : "List"}
        </button>
      ))}
    </div>
  );
}
