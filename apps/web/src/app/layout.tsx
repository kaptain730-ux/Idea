import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";
import { getSessionUser } from "@/lib/session";
import { UserMenu } from "@/components/UserMenu";
import { SessionProvider } from "@/components/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CampusDash",
  description: "Smart campus logistics platform for peer-to-peer deliveries",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${styles.body}`}>
        <SessionProvider initialUser={user}>
          <div className={styles.shell}>
            <header className={styles.header}>
              <Link href="/" className={styles.brand}>
                CampusDash
              </Link>
              <nav className={styles.nav}>
                <Link href="/requests">Requests</Link>
                <Link href="/requests/new">Create request</Link>
                <Link href="/runner">Runner console</Link>
              </nav>
              <UserMenu />
            </header>
            <div className={styles.content}>{children}</div>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
