import { requireRole } from "@/lib/auth";

// Guard: manajemen buku hanya untuk admin dan pegawai.
export default async function Layout({ children }) {
  await requireRole("admin", "pegawai");
  return children;
}
