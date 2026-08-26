import { createHash, randomBytes } from "node:crypto";
import { and, count, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { adminSessions, adminUsers, type AdminRole } from "@/db/schema";

export const SESSION_COOKIE_NAME = "ciyu_admin_session";
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export type CurrentAdmin = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
};

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function generateSession() {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    tokenHash: hashSessionToken(token),
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
  };
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
    priority: "high",
  });
}

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const [admin] = await db
    .select({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      role: adminUsers.role,
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.adminUserId, adminUsers.id))
    .where(
      and(
        eq(adminSessions.tokenHash, hashSessionToken(token)),
        gt(adminSessions.expiresAt, new Date()),
        eq(adminUsers.isActive, true),
      ),
    )
    .limit(1);

  return admin ?? null;
}

export async function hasAnyAdmin() {
  const [result] = await db.select({ value: count() }).from(adminUsers);
  return (result?.value ?? 0) > 0;
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/signin");
  return admin;
}

export async function requireSystemAdmin() {
  const admin = await requireAdmin();
  if (admin.role !== "system_admin") redirect("/books");
  return admin;
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await db
      .delete(adminSessions)
      .where(eq(adminSessions.tokenHash, hashSessionToken(token)));
  }

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });
}
