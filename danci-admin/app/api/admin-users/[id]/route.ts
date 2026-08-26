import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { adminSessions, adminUsers } from "@/db/schema";
import { listAdminUsers } from "@/lib/admin-users.server";
import { getCurrentAdmin } from "@/lib/auth.server";
import { hashPassword } from "@/lib/password.server";
import {
  getDatabaseErrorCode,
  isSameOriginRequest,
  normalizeEmail,
} from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

async function authorizeSystemAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "请先登录", status: 401 } as const;
  if (admin.role !== "system_admin") {
    return { error: "无权管理管理员账号", status: 403 } as const;
  }
  return { admin } as const;
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "请求来源无效" }, { status: 403 });
  }

  const authorization = await authorizeSystemAdmin();
  if ("error" in authorization) {
    return NextResponse.json(
      { error: authorization.error },
      { status: authorization.status },
    );
  }

  const { id } = await context.params;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "请求参数无效" }, { status: 400 });
  }

  const [target] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1);
  if (!target) {
    return NextResponse.json({ error: "管理员不存在" }, { status: 404 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : target.name;
  const email = body.email === undefined ? target.email : normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  const isActive =
    typeof body.isActive === "boolean" ? body.isActive : target.isActive;

  if (name.length < 2 || name.length > 100) {
    return NextResponse.json({ error: "姓名长度需要在 2 到 100 个字符之间" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
    return NextResponse.json({ error: "请输入有效的邮箱地址" }, { status: 400 });
  }
  if (password && (password.length < 8 || password.length > 128)) {
    return NextResponse.json({ error: "新密码长度需要在 8 到 128 位之间" }, { status: 400 });
  }
  if (target.role === "system_admin" && !isActive) {
    return NextResponse.json({ error: "系统管理员不能被停用" }, { status: 400 });
  }

  const updates: {
    name: string;
    email: string;
    isActive: boolean;
    updatedAt: Date;
    passwordHash?: string;
  } = {
    name,
    email,
    isActive,
    updatedAt: new Date(),
  };
  if (password) updates.passwordHash = await hashPassword(password);

  try {
    await db.transaction(async (tx) => {
      await tx.update(adminUsers).set(updates).where(eq(adminUsers.id, id));
      if (!isActive) {
        await tx.delete(adminSessions).where(eq(adminSessions.adminUserId, id));
      }
    });

    const [admin] = (await listAdminUsers()).filter((item) => item.id === id);
    revalidatePath("/admin-users");
    return NextResponse.json({ admin });
  } catch (error) {
    if (getDatabaseErrorCode(error) === "23505") {
      return NextResponse.json({ error: "该邮箱已被使用" }, { status: 409 });
    }
    console.error("Failed to update administrator", error);
    return NextResponse.json({ error: "更新管理员失败" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "请求来源无效" }, { status: 403 });
  }

  const authorization = await authorizeSystemAdmin();
  if ("error" in authorization) {
    return NextResponse.json(
      { error: authorization.error },
      { status: authorization.status },
    );
  }

  const { id } = await context.params;
  const [target] = await db
    .select({ role: adminUsers.role })
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1);
  if (!target) {
    return NextResponse.json({ error: "管理员不存在" }, { status: 404 });
  }
  if (target.role === "system_admin") {
    return NextResponse.json({ error: "系统管理员不能被删除" }, { status: 400 });
  }

  await db.delete(adminUsers).where(eq(adminUsers.id, id));
  revalidatePath("/admin-users");
  return NextResponse.json({ success: true });
}
