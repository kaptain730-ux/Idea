import Link from "next/link";
import { fetchLocations, fetchUsers } from "@/lib/requests";
import { getSessionUser } from "@/lib/session";
import { NewRequestForm } from "./NewRequestForm";
import styles from "./new-request.module.css";

export default async function NewRequestPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className={styles.page}>
        <div className={styles.heading}>
          <h1>Create a campus request</h1>
          <p>You need to log in to request a runner. Use your campus email to continue.</p>
          <Link href="/login">Login to continue</Link>
        </div>
      </div>
    );
  }

  const [locations, users] = await Promise.all([fetchLocations(), fetchUsers()]);
  const studentRequesters = users.filter((candidate) => candidate.role === "STUDENT");

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <p>
          <Link href="/requests">← Back to requests</Link>
        </p>
        <h1>Create a campus request</h1>
        <p>Share pickup, drop, and timing to broadcast the task to nearby runners.</p>
      </div>

      <NewRequestForm locations={locations} requesters={studentRequesters} currentUser={user} />
    </div>
  );
}
