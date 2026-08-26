import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const ADMIN_ROLES = ["system_admin", "admin"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const adminUsers = pgTable(
  "admin-users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    passwordHash: varchar("password_hash", { length: 512 }).notNull(),
    role: varchar("role", { length: 20, enum: ADMIN_ROLES })
      .notNull()
      .default("admin"),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", {
      withTimezone: true,
      mode: "date",
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("admin_users_email_unique_idx").on(table.email),
    uniqueIndex("admin_users_single_system_admin_idx")
      .on(table.role)
      .where(sql`${table.role} = 'system_admin'`),
  ],
);

export const adminSessions = pgTable(
  "admin-session",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    adminUserId: uuid("admin_user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("admin_session_token_hash_unique_idx").on(table.tokenHash),
    index("admin_session_admin_user_idx").on(table.adminUserId),
    index("admin_session_expires_at_idx").on(table.expiresAt),
  ],
);

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
