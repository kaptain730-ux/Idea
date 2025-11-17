import { NextResponse } from "next/server";
import { authorizedFetch } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.text();
  const response = await authorizedFetch("/requests", {
    method: "POST",
    body
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}
