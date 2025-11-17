import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { LoginForm } from "./LoginForm";
import styles from "./login.module.css";

export default async function LoginPage() {
  const user = await getSessionUser();

  if (user) {
    return (
      <div className={styles.formShell}>
        <div className={styles.formCard}>
          <p>You are already logged in as {user.name ?? user.email}.</p>
          <Link href="/">Go to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formShell}>
      <div className={styles.formCard}>
        <h1>Login to CampusDash</h1>
        <p>Use your campus email to receive a one-time code.</p>
        <LoginForm />
      </div>
    </div>
  );
}
