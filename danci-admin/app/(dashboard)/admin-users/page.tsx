import { AdminUsersManager } from "@/components/admin-users-manager";
import { listAdminUsers } from "@/lib/admin-users.server";
import { requireSystemAdmin } from "@/lib/auth.server";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const currentAdmin = await requireSystemAdmin();
  const admins = await listAdminUsers();

  return (
    <AdminUsersManager
      initialAdmins={admins}
      currentAdminId={currentAdmin.id}
    />
  );
}
