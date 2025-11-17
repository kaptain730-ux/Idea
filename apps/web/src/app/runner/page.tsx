import Link from "next/link";
import { authorizedFetch, getSessionUser } from "@/lib/session";
import { RunnerTaskBoard } from "./RunnerTaskBoard";
import { RunnerSummaryPanel } from "./RunnerSummaryPanel";
import styles from "./runner.module.css";

export default async function RunnerDashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className={styles.page}>
        <h1>Runner console</h1>
        <p className={styles.helper}>Log in as a runner to accept and complete tasks.</p>
        <Link href="/login">Login</Link>
      </div>
    );
  }

  if (user.role !== "RUNNER") {
    return (
      <div className={styles.page}>
        <h1>Runner console</h1>
        <p className={styles.helper}>This view is restricted to registered runners.</p>
      </div>
    );
  }

  const [tasksResponse, summaryResponse] = await Promise.all([
    authorizedFetch(`/runner/tasks?runnerId=${user.id}`),
    authorizedFetch(`/runner/summary?runnerId=${user.id}`)
  ]);

  if (!tasksResponse.ok || !summaryResponse.ok) {
    return (
      <div className={styles.page}>
        <h1>Runner console</h1>
        <p className={styles.helper}>Unable to load runner data. Please try again.</p>
      </div>
    );
  }

  const tasks = await tasksResponse.json();
  const summary = await summaryResponse.json();

  return (
    <div className={styles.page}>
      <div>
        <p className={styles.label}>Runner console</p>
        <h1>Deliveries in progress</h1>
        <p className={styles.helper}>Accept tasks, track active jobs, and mark them complete.</p>
      </div>
      <RunnerSummaryPanel summary={summary} />
      <RunnerTaskBoard runnerId={user.id} tasks={tasks} />
    </div>
  );
}
