import { requireRole } from "@/lib/auth";

// Guard: transaksi peminjaman hanya untuk pegawai dan admin.
export default async function Layout({ children }) {
  await requireRole("admin", "pegawai");
  return children;
}
