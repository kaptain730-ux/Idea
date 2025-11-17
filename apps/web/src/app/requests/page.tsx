import Link from "next/link";
import { fetchRequests, REQUEST_STATUSES } from "@/lib/requests";
import { RequestCard } from "./_components/RequestCard";
import styles from "./requests.module.css";

const filters = ["ALL", ...REQUEST_STATUSES];

type RequestsPageProps = {
  searchParams?: { status?: string };
};

export default async function RequestsPage({ searchParams }: RequestsPageProps) {
  const params = searchParams ?? {};
  const activeStatus = params.status && params.status !== "ALL" ? params.status : undefined;
  const requests = await fetchRequests(activeStatus);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.cardLabel}>Operations</p>
          <h1>Requests overview</h1>
        </div>
        <div className={styles.actions}>
          <Link href="/requests/new" className={`${styles.actionLink} ${styles.actionPrimary}`}>
            New request
          </Link>
          <Link href="/" className={styles.actionLink}>
            Dashboard
          </Link>
        </div>
      </div>

      <div className={styles.filters}>
        {filters.map((status) => (
          <Link
            key={status}
            href={status === "ALL" ? "/requests" : `/requests?status=${status}`}
            className={`${styles.filterChip} ${
              status === (activeStatus ?? "ALL") ? styles.filterChipActive : ""
            }`}
          >
            {status.replace("_", " ")}
          </Link>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No requests yet. Create one to see it here.</p>
          <Link href="/requests/new">Create your first request</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}
