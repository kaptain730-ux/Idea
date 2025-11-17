"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  acceptRunnerTask,
  completeRunnerTask,
  type RunnerTasksResponse
} from "@/lib/requests";
import { StatusBadge } from "../requests/_components/StatusBadge";
import styles from "./runner.module.css";

export type RunnerTaskBoardProps = {
  runnerId: string;
  tasks: RunnerTasksResponse;
};

export function RunnerTaskBoard({ runnerId, tasks }: RunnerTaskBoardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const acceptTask = (taskId: string) => {
    startTransition(async () => {
      await acceptRunnerTask(taskId, runnerId);
      router.refresh();
    });
  };

  const completeTask = (taskId: string) => {
    const actualCostInput = window.prompt("Actual payout (optional)");
    const actualCost = actualCostInput ? Number(actualCostInput) : undefined;

    startTransition(async () => {
      await completeRunnerTask(taskId, runnerId, actualCost);
      router.refresh();
    });
  };

  return (
    <div className={styles.board}>
      <section>
        <div className={styles.sectionHeading}>
          <h2>Assigned tasks</h2>
          <p>{tasks.assigned.length} active</p>
        </div>
        {tasks.assigned.length === 0 ? (
          <p className={styles.empty}>No tasks accepted yet.</p>
        ) : (
          <div className={styles.list}>
            {tasks.assigned.map((task) => (
              <article key={task.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <p className={styles.label}>Task</p>
                    <h3>{task.taskType}</h3>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
                <div className={styles.route}>
                  <div>
                    <span className={styles.label}>Pickup</span>
                    <strong>{task.pickupLocation.name}</strong>
                  </div>
                  <span className={styles.arrow}>→</span>
                  <div>
                    <span className={styles.label}>Drop</span>
                    <strong>{task.dropLocation.name}</strong>
                  </div>
                </div>
                <div className={styles.metaRow}>
                  <span>Requester: {task.requester?.name ?? "Unknown"}</span>
                  <span>{new Date(task.createdAt).toLocaleString()}</span>
                </div>
                <div className={styles.actions}>
                  <button onClick={() => completeTask(task.id)} disabled={isPending}>
                    Mark completed
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className={styles.sectionHeading}>
          <h2>Available tasks</h2>
          <p>{tasks.available.length} nearby</p>
        </div>
        {tasks.available.length === 0 ? (
          <p className={styles.empty}>No available tasks right now.</p>
        ) : (
          <div className={styles.list}>
            {tasks.available.map((task) => (
              <article key={task.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <p className={styles.label}>Task</p>
                    <h3>{task.taskType}</h3>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
                <div className={styles.route}>
                  <div>
                    <span className={styles.label}>Pickup</span>
                    <strong>{task.pickupLocation.name}</strong>
                  </div>
                  <span className={styles.arrow}>→</span>
                  <div>
                    <span className={styles.label}>Drop</span>
                    <strong>{task.dropLocation.name}</strong>
                  </div>
                </div>
                <div className={styles.metaRow}>
                  <span>Requester: {task.requester?.name ?? "Unknown"}</span>
                  <span>{new Date(task.createdAt).toLocaleString()}</span>
                </div>
                <div className={styles.actions}>
                  <button onClick={() => acceptTask(task.id)} disabled={isPending}>
                    Accept task
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
