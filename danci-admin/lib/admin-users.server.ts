import { asc } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import type { AdminListItem } from "@/lib/admin-types";

export async function listAdminUsers(): Promise<AdminListItem[]> {
  const rows = await db
    .select({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      role: adminUsers.role,
      isActive: adminUsers.isActive,
      lastLoginAt: adminUsers.lastLoginAt,
      createdAt: adminUsers.createdAt,
      updatedAt: adminUsers.updatedAt,
    })
    .from(adminUsers)
    .orderBy(asc(adminUsers.createdAt));

  return rows.map((admin) => ({
    ...admin,
    lastLoginAt: admin.lastLoginAt?.toISOString() ?? null,
    createdAt: admin.createdAt.toISOString(),
    updatedAt: admin.updatedAt.toISOString(),
  }));
}
