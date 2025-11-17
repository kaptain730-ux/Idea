import Link from "next/link";
import { Badge } from "@campusdash/ui";
import styles from "./page.module.css";

const highlights = [
  { label: "Tasks today", value: "42" },
  { label: "Available runners", value: "18" },
  { label: "Avg. delivery time", value: "11m" }
];

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <Badge tone="success">CampusDash Alpha</Badge>
          <h1>Move anything across campus without a scooter.</h1>
          <p>
            CampusDash coordinates students, staff, and campus businesses with
            peer runners, smart routing, and real-time tracking.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primary} href="/requests/new">
              Create request
            </Link>
            <Link className={styles.secondary} href="/requests">
              View requests
            </Link>
          </div>
        </div>
        <section className={styles.metrics}>
          {highlights.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
