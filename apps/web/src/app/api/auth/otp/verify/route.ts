import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/"
};

export async function POST(request: Request) {
  const body = await request.text();
  const response = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body
  });

  const data = await response.json().catch(() => ({}));
  const nextResponse = NextResponse.json(data, { status: response.status });

  if (response.ok && data.accessToken && data.refreshToken) {
    nextResponse.cookies.set("accessToken", data.accessToken, cookieOptions);
    nextResponse.cookies.set("refreshToken", data.refreshToken, cookieOptions);
  }

  return nextResponse;
}
