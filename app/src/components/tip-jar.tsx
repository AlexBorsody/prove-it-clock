"use client";

import { useState } from "react";
import styles from "./tip-jar.module.css";
import { TIPS } from "@/lib/tips";

export default function TipJar({
  qrSvgs,
  bare = false,
}: {
  /** Server-rendered QR code SVGs keyed by coin label. */
  qrSvgs?: Record<string, string>;
  /** Skip the built-in heading/blurb when the page provides its own. */
  bare?: boolean;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(address: string) {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(address);
      setTimeout(() => setCopied((c) => (c === address ? null : c)), 2000);
    } catch {
      setCopied(null);
    }
  }

  return (
    <section className={styles.tipjar} aria-label="Tip jar">
      {!bare && (
        <>
          <h2 className={styles.title}>Tip jar</h2>
          <p className={styles.blurb}>
            Bubble or Build is free and independent. If the record-keeping is
            worth something to you, tips keep it running.
          </p>
        </>
      )}
      <ul className={styles.list}>
        {TIPS.map((tip) => {
          const qr = qrSvgs?.[tip.label];
          return (
            <li key={tip.label} className={styles.row}>
              {qr && (
                <span
                  className={styles.qr}
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: qr }}
                />
              )}
              <div className={styles.details}>
                <span className={styles.coin}>
                  {tip.label}{" "}
                  <span className={styles.network}>({tip.network})</span>
                </span>
                <code className={styles.address}>{tip.address}</code>
              </div>
              <button
                type="button"
                className={styles.copy}
                onClick={() => copy(tip.address)}
              >
                {copied === tip.address ? "Copied" : "Copy"}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
