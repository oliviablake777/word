import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { listAdminUsers } from "@/lib/admin-users.server";
import { getCurrentAdmin } from "@/lib/auth.server";
import { hashPassword } from "@/lib/password.server";
import {
  getDatabaseErrorCode,
  isSameOriginRequest,
  validateAdminInput,
} from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorizeSystemAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "请先登录", status: 401 } as const;
  if (admin.role !== "system_admin") {
    return { error: "无权管理管理员账号", status: 403 } as const;
  }
  return { admin } as const;
}

export async function GET() {
  const authorization = await authorizeSystemAdmin();
  if ("error" in authorization) {
    return NextResponse.json(
      { error: authorization.error },
      { status: authorization.status },
    );
  }

  return NextResponse.json({ admins: await listAdminUsers() });
}

export async function POST(request: Request) {
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

  try {
    const [createdAdmin] = await db
      .insert(adminUsers)
      .values({
        name: validation.data.name,
        email: validation.data.email,
        passwordHash: await hashPassword(validation.data.password),
        role: "admin",
      })
      .returning({ id: adminUsers.id });

    const [admin] = (await listAdminUsers()).filter(
      (item) => item.id === createdAdmin.id,
    );
    revalidatePath("/admin-users");
    return NextResponse.json({ admin }, { status: 201 });
  } catch (error) {
    if (getDatabaseErrorCode(error) === "23505") {
      return NextResponse.json({ error: "该邮箱已被使用" }, { status: 409 });
    }
    console.error("Failed to create administrator", error);
    return NextResponse.json({ error: "创建管理员失败" }, { status: 500 });
  }
}
