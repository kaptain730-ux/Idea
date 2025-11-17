import { NextRequest, NextResponse } from "next/server";
import { authorizedFetch } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const body = await request.text();
  const { id } = await context.params;
  const response = await authorizedFetch(`/runner/tasks/${id}/accept`, {
    method: "POST",
    body
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}
