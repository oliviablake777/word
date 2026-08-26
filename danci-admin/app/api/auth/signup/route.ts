import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { adminSessions, adminUsers } from "@/db/schema";
import { generateSession, setSessionCookie } from "@/lib/auth.server";
import { hashPassword } from "@/lib/password.server";
import {
  getDatabaseErrorCode,
  isSameOriginRequest,
  validateAdminInput,
} from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

class SetupAlreadyCompletedError extends Error {}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "请求来源无效" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求参数无效" }, { status: 400 });
  }

  const validation = validateAdminInput(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const passwordHash = await hashPassword(validation.data.password);
  const session = generateSession();

  try {
    const admin = await db.transaction(
      async (tx) => {
        // Serializes first-admin registration across concurrent requests.
        await tx.execute(sql`select pg_advisory_xact_lock(713202608)`);

        const [existingAdmin] = await tx
          .select({ id: adminUsers.id })
          .from(adminUsers)
          .limit(1);

        if (existingAdmin) throw new SetupAlreadyCompletedError();

        const [createdAdmin] = await tx
          .insert(adminUsers)
          .values({
            name: validation.data.name,
            email: validation.data.email,
            passwordHash,
            role: "system_admin",
          })
          .returning({
            id: adminUsers.id,
            name: adminUsers.name,
            email: adminUsers.email,
            role: adminUsers.role,
          });

        await tx.insert(adminSessions).values({
          adminUserId: createdAdmin.id,
          tokenHash: session.tokenHash,
          expiresAt: session.expiresAt,
        });

        return createdAdmin;
      },
      { isolationLevel: "serializable" },
    );

    await setSessionCookie(session.token, session.expiresAt);
    return NextResponse.json({ admin }, { status: 201 });
  } catch (error) {
    if (error instanceof SetupAlreadyCompletedError) {
      return NextResponse.json(
        { error: "系统管理员已经完成注册", code: "SETUP_COMPLETED" },
        { status: 409 },
      );
    }
    if (getDatabaseErrorCode(error) === "23505") {
      return NextResponse.json({ error: "该邮箱已被使用" }, { status: 409 });
    }
    console.error("Failed to register the system administrator", error);
    return NextResponse.json({ error: "注册失败，请稍后重试" }, { status: 500 });
  }
}
