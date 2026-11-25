import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { createBuku } from "@/actions/buku";
import BukuForm from "@/components/BukuForm";
import DashboardShell from "@/components/DashboardShell";

export const metadata = { title: "Tambah Buku" };

export default async function BukuBaruPage() {
  const user = await requireRole("admin", "pegawai");
  const { rows: categories } = await pool.query(
    "SELECT id, nama, kode FROM categories ORDER BY nama"
  );

  return (
    <DashboardShell user={user} title="Tambah Buku" subtitle="Tambahkan koleksi buku baru ke perpustakaan.">
      <div className="mx-auto max-w-2xl py-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <BukuForm action={createBuku} categories={categories} submitLabel="Simpan" />
        </div>
      </div>
    </DashboardShell>
  );
}
