"use client";

import { useState } from "react";
import styles from "./tip-jar.module.css";

const TIPS: { label: string; network: string; address: string }[] = [
  {
    label: "BTC",
    network: "Bitcoin",
    address: "1PAgr3wz6pwPdagcM7ebY3VBcXtTQ1Q5z3",
  },
  {
    label: "BAT",
    network: "Ethereum",
    address: "0x13b438F5c7377E2f04D066365e44c92c37a1a6EE",
  },
  {
    label: "LTC",
    network: "Litecoin",
    address: "LYHNar5p93BRqMEGxpowDLo6nVXXwDtz1d",
  },
  {
    label: "SOL",
    network: "Solana",
    address: "GVAV2cBmJYiKaUtu7ubPjN2aVwEZaaAWfn8g2KeFa8r4",
  },
  {
    label: "DASH",
    network: "Dash",
    address: "Xcycby8KzEkqTSx3L1Y33pfF1VSaQrBDep",
  },
  {
    label: "ETH",
    network: "Ethereum",
    address: "0xED304FE2eF534D4773ee182C188d30A358D35d75",
  },
  {
    label: "LINK",
    network: "Ethereum",
    address: "0x5DF6DaB753Be058AAaaf55c47b569B4a6B1B0489",
  },
  {
    label: "ZRO",
    network: "Ethereum",
    address: "0x35876eab0959874dB8df9895dbaa46bE9643dBEc",
  },
];

export default function TipJar() {
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
      <h2 className={styles.title}>Tip jar</h2>
      <p className={styles.blurb}>
        Bubble or Build is free and independent. If the record-keeping is worth
        something to you, tips keep it running.
      </p>
      <ul className={styles.list}>
        {TIPS.map((tip) => (
          <li key={tip.label} className={styles.row}>
            <span className={styles.coin}>
              {tip.label} <span className={styles.network}>({tip.network})</span>
            </span>
            <code className={styles.address}>{tip.address}</code>
            <button
              type="button"
              className={styles.copy}
              onClick={() => copy(tip.address)}
            >
              {copied === tip.address ? "Copied" : "Copy"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
