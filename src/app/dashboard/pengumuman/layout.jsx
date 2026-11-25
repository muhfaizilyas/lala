import { requireRole } from "@/lib/auth";

// Guard: manajemen pengumuman hanya untuk admin dan pegawai.
export default async function Layout({ children }) {
  await requireRole("admin", "pegawai");
  return children;
}
