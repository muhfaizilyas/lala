import { requireRole } from "@/lib/auth";

// Guard: semua halaman di bawah /dashboard/pegawai hanya untuk role "pegawai".
export default async function Layout({ children }) {
  await requireRole("pegawai");
  return children;
}
