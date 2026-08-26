import { NextResponse } from "next/server";
import { destroyCurrentSession } from "@/lib/auth.server";
import { isSameOriginRequest } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "请求来源无效" }, { status: 403 });
  }

  await destroyCurrentSession();
  return NextResponse.json({ success: true });
}
