import { and, eq, lt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { adminSessions, adminUsers } from "@/db/schema";
import {
  generateSession,
  hasAnyAdmin,
  setSessionCookie,
} from "@/lib/auth.server";
import { hashPassword, verifyPassword } from "@/lib/password.server";
import { isSameOriginRequest, validateCredentials } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "请求来源无效" }, { status: 403 });
  }

  if (!(await hasAnyAdmin())) {
    return NextResponse.json(
      { error: "请先创建系统管理员", code: "SETUP_REQUIRED" },
      { status: 409 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求参数无效" }, { status: 400 });
  }

  const validation = validateCredentials(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, validation.data.email))
    .limit(1);

  if (!admin) {
    // Keep missing-account and invalid-password requests similarly expensive.
    await hashPassword(validation.data.password);
    return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
  }

  const passwordMatches = await verifyPassword(
    validation.data.password,
    admin.passwordHash,
  );
  if (!passwordMatches) {
    return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
  }
  if (!admin.isActive) {
    return NextResponse.json({ error: "该管理员账号已被停用" }, { status: 403 });
  }

  const session = generateSession();
  const now = new Date();

  await db.transaction(async (tx) => {
    await tx
      .delete(adminSessions)
      .where(
        and(
          eq(adminSessions.adminUserId, admin.id),
          lt(adminSessions.expiresAt, now),
        ),
      );
    await tx.insert(adminSessions).values({
      adminUserId: admin.id,
      tokenHash: session.tokenHash,
      expiresAt: session.expiresAt,
    });
    await tx
      .update(adminUsers)
      .set({ lastLoginAt: now, updatedAt: now })
      .where(eq(adminUsers.id, admin.id));
  });

  await setSessionCookie(session.token, session.expiresAt);
  return NextResponse.json({
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
}
