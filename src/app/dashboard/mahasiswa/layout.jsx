import { requireRole } from "@/lib/auth";

// Guard: semua halaman di bawah /dashboard/mahasiswa hanya untuk role "mahasiswa".
export default async function Layout({ children }) {
  await requireRole("mahasiswa");
  return children;
}
