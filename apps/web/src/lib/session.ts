import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/"
};

async function setTokens(accessToken: string, refreshToken: string) {
  const store = await cookies();
  store.set("accessToken", accessToken, cookieOptions);
  store.set("refreshToken", refreshToken, cookieOptions);
}

async function refreshTokens() {
  const store = await cookies();
  const refreshToken = store.get("refreshToken")?.value;

  if (!refreshToken) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken })
  });

  if (!response.ok) {
    store.delete("accessToken");
    store.delete("refreshToken");
    return null;
  }

  const data = (await response.json()) as { accessToken: string; refreshToken: string };
  await setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

export async function authorizedFetch(
  path: string,
  init?: RequestInit,
  options: { retry?: boolean } = { retry: true }
): Promise<Response> {
  const store = await cookies();
  let accessToken: string | undefined = store.get("accessToken")?.value ?? undefined;

  if (!accessToken) {
    const refreshed = await refreshTokens();
    accessToken = refreshed ?? undefined;
    if (!accessToken) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store"
  });

  if (response.status === 401 && options.retry) {
    const newToken = await refreshTokens();
    if (!newToken) {
      return response;
    }
    return authorizedFetch(path, init, { retry: false });
  }

  return response;
}

export async function getSessionUser() {
  const response = await authorizedFetch("/auth/me");
  if (!response.ok) {
    return null;
  }
  return response.json();
}
