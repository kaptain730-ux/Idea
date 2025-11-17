import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import type { RequestRecord } from "@/lib/requests";
import styles from "../requests.module.css";

export function RequestCard({ request }: { request: RequestRecord }) {
  return (
    <Link href={`/requests/${request.id}`} className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <p className={styles.cardLabel}>Task</p>
          <h3>{request.taskType}</h3>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className={styles.route}>
        <div>
          <p className={styles.cardLabel}>Pickup</p>
          <strong>{request.pickupLocation.name}</strong>
        </div>
        <span className={styles.arrow}>→</span>
        <div>
          <p className={styles.cardLabel}>Drop</p>
          <strong>{request.dropLocation.name}</strong>
        </div>
      </div>

      <div className={styles.metaRow}>
        <span>Requester: {request.requester?.name ?? "Unknown"}</span>
        <span>Created {new Date(request.createdAt).toLocaleString()}</span>
      </div>
    </Link>
  );
}
