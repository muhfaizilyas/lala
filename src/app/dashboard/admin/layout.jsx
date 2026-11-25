import { requireRole } from "@/lib/auth";

// Guard: semua halaman di bawah /dashboard/admin hanya untuk role "admin".
export default async function Layout({ children }) {
  await requireRole("admin");
  return children;
}
