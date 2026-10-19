"use client";

/**
 * Promise notifications card: its own section on the project page with two
 * alert tiers and a collapsible methodology explainer.
 */
import PushSubscribeToggle from "./push-subscribe-toggle";
import InfoTip from "./info-tip";
import styles from "./notify-card.module.css";

export default function NotifyCard({ projectSlug, projectName }: { projectSlug: string; projectName: string }) {
  return (
    <div className={`panel ${styles.card}`}>
      <h2 className={styles.title}>Promise notifications</h2>
      <p className={styles.lede}>
        Choose which {projectName} promise updates should reach you: matching news, published promise outcomes, or both.
      </p>
      <div className={styles.tiers}>
        <div className={styles.tier}>
          <PushSubscribeToggle
            projectSlug={projectSlug}
            kind="news"
            label="Any news mention"
            subscribedLabel="News alerts on"
          />
          <InfoTip text={`Every article our scanner links to a ${projectName} promise.`} />
        </div>
        <div className={styles.tier}>
          <PushSubscribeToggle
            projectSlug={projectSlug}
            label="Promise outcomes"
            subscribedLabel="Outcomes on"
            showUnavailable
          />
          <InfoTip text="Alerts when a human publishes a promise status change in the ledger." />
        </div>
      </div>
      <details className={styles.how}>
        <summary>How this works</summary>
        <div className={styles.howBody}>
          <p>
            <strong>News mentions.</strong> Our scanner checks fresh articles against open promises.
            When an article matches, you get the headline and publisher. A mention is an observed fact,
            not a judgment.
          </p>
          <p>
            <strong>Promise outcomes.</strong> When a human publishes a promise status change in the ledger,
            you get an alert. The scanner can suggest an assessment, but it cannot change the published ledger.
          </p>
          <p>
            <strong>What you will never get.</strong> Price moves, market data, or hype. Notifications cover
            ledger and news events only.
          </p>
        </div>
      </details>
    </div>
  );
}
