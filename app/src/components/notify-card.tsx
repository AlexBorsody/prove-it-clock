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
        Get a push alert when news touches one of {projectName}&apos;s promises. Two tiers, pick either or both.
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
            kind="resolution"
            label="Decisive news only"
            subscribedLabel="Decisive alerts on"
          />
          <InfoTip text="Only articles that look like they settle a promise." />
        </div>
      </div>
      <details className={styles.how}>
        <summary>How this works</summary>
        <div className={styles.howBody}>
          <p>
            <strong>Any news mention.</strong> Our scanner checks fresh articles against every open promise.
            When an article matches, you get the headline and the publisher. A mention is an observed fact,
            not a judgment.
          </p>
          <p>
            <strong>Decisive news only.</strong> When a headline carries explicit delivery or failure language,
            the scanner drafts a fulfilled or lapsed assessment and you get alerted at that point. The published
            ledger only changes after a human verifies the source, so treat the alert as a heads up, not a verdict.
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
