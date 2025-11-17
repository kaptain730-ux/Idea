"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
};

type SessionContextValue = {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
  refreshUser: () => Promise<void>;
  isRefreshing: boolean;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children, initialUser }: { children: ReactNode; initialUser: SessionUser | null }) {
  const [user, setUser] = useState<SessionUser | null>(initialUser ?? null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshUser = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) {
        setUser(null);
        return;
      }
      const data = await response.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const value = useMemo(() => ({ user, setUser, refreshUser, isRefreshing }), [user, refreshUser, isRefreshing]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}
