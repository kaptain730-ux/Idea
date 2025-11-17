import { type RunnerSummary } from "@/lib/requests";
import styles from "./runner.module.css";

function formatCurrency(value: string | number) {
  const amount = typeof value === "string" ? Number(value) : value ?? 0;
  return Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    amount || 0
  );
}

export function RunnerSummaryPanel({ summary }: { summary: RunnerSummary }) {
  return (
    <div className={styles.summaryGrid}>
      <article>
        <p className={styles.label}>Total earnings</p>
        <strong>{formatCurrency(summary.totalEarnings)}</strong>
        <span className={styles.helper}>All-time settled payouts</span>
      </article>
      <article>
        <p className={styles.label}>This week</p>
        <strong>{formatCurrency(summary.weeklyEarnings)}</strong>
        <span className={styles.helper}>Last 7 days</span>
      </article>
      <article>
        <p className={styles.label}>Completed tasks</p>
        <strong>{summary.completedCount}</strong>
        <span className={styles.helper}>Lifetime deliveries</span>
      </article>
      <article className={styles.historyCard}>
        <p className={styles.label}>Recent payouts</p>
        <ul>
          {summary.recentPayments.length === 0 && <li>No payouts yet.</li>}
          {summary.recentPayments.map((payment) => (
            <li key={payment.id}>
              <div>
                <strong>{payment.taskType}</strong>
                <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
              </div>
              <span>{formatCurrency(payment.amount)}</span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
