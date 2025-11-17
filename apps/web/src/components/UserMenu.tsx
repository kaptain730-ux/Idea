"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "./SessionProvider";
import styles from "./user-menu.module.css";

export function UserMenu() {
  const router = useRouter();
  const { user, refreshUser, setUser } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const logout = async () => {
    setIsSubmitting(true);
    await fetch("/api/auth/logout", { method: "POST" });
    await refreshUser();
    setUser(null);
    router.push("/login");
    setIsSubmitting(false);
  };

  if (!user) {
    return (
      <Link className={styles.loginButton} href="/login">
        Login
      </Link>
    );
  }

  return (
    <div className={styles.menu}>
      <div>
        <p className={styles.name}>{user.name ?? user.email}</p>
        <small>{user.role.toLowerCase()}</small>
      </div>
      <button onClick={logout} disabled={isSubmitting}>
        Logout
      </button>
    </div>
  );
}
