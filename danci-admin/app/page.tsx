import { redirect } from "next/navigation";
import { getCurrentAdmin, hasAnyAdmin } from "@/lib/auth.server";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (!(await hasAnyAdmin())) redirect("/signup");
  redirect((await getCurrentAdmin()) ? "/books" : "/signin");
}
