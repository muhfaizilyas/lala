import { redirect } from "next/navigation";
import { requireUser, dashboardPath } from "@/lib/auth";

// /dashboard hanya "pintu": belum login -> /login, sudah login -> dashboard sesuai role.
export default async function DashboardIndex() {
  const user = await requireUser();
  redirect(dashboardPath(user.role));
}
