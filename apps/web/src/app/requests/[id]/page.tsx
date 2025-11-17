import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchRequest } from "@/lib/requests";
import { StatusBadge } from "../_components/StatusBadge";
import styles from "./detail.module.css";

type RequestDetailPageProps = {
  params: { id: string };
};

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
  const { id } = params;
  let request;

  try {
    request = await fetchRequest(id);
  } catch {
    return notFound();
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.breadcrumb}>
        <Link href="/requests">← Back to requests</Link>
      </p>

      <div className={styles.metaCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p className={styles.label}>Request</p>
            <h1>{request.taskType}</h1>
          </div>
          <StatusBadge status={request.status} />
        </div>

        <div className={styles.metaGrid}>
          <div>
            <span className={styles.label}>Pickup</span>
            <span className={styles.value}>{request.pickupLocation.name}</span>
          </div>
          <div>
            <span className={styles.label}>Drop</span>
            <span className={styles.value}>{request.dropLocation.name}</span>
          </div>
          <div>
            <span className={styles.label}>Requester</span>
            <span className={styles.value}>{request.requester?.name ?? "Unknown"}</span>
          </div>
          <div>
            <span className={styles.label}>Runner</span>
            <span className={styles.value}>{request.runner?.name ?? "Unassigned"}</span>
          </div>
        </div>

        <div className={styles.metaGrid}>
          <div>
            <span className={styles.label}>Preferred time</span>
            <span className={styles.value}>
              {request.preferredTime ? new Date(request.preferredTime).toLocaleString() : "ASAP"}
            </span>
          </div>
          <div>
            <span className={styles.label}>Instructions</span>
            <span className={styles.value}>{request.instructions ?? "—"}</span>
          </div>
        </div>
      </div>

      <div className={styles.timeline}>
        <h2>Timeline</h2>
        <ul>
          {(request.events ?? []).map((event) => (
            <li key={event.id}>
              <span>{event.status}</span>
              <span>{new Date(event.timestamp).toLocaleString()}</span>
            </li>
          ))}
          {(!request.events || request.events.length === 0) && <li>No events recorded yet.</li>}
        </ul>
      </div>
    </div>
  );
}
