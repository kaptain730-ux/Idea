import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(request: Request) {
  const body = await request.text();
  const response = await fetch(`${API_BASE_URL}/auth/otp/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}
