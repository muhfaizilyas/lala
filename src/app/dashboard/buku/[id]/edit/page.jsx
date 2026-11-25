import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { parseId } from "@/lib/parseId";
import { requireRole } from "@/lib/auth";
import { updateBuku } from "@/actions/buku";
import BukuForm from "@/components/BukuForm";
import DashboardShell from "@/components/DashboardShell";

export const metadata = { title: "Edit Buku" };

export default async function EditBukuPage({ params }) {
  const user = await requireRole("admin", "pegawai");

  const { id } = await params;
  const bukuId = parseId(id);
  if (!bukuId) notFound();

  const [{ rows }, { rows: categories }] = await Promise.all([
    pool.query(
      `SELECT judul, isbn, pengarang, penerbit, tahun_terbit, category_id,
              stok_total, durasi_maks_pinjam, denda_per_hari::int AS denda_per_hari, cover_url
         FROM books WHERE id = $1`,
      [bukuId]
    ),
    pool.query("SELECT id, nama, kode FROM categories ORDER BY nama"),
  ]);
  if (rows.length === 0) notFound();

  // Semua nilai form berupa string
  const initial = Object.fromEntries(
    Object.entries(rows[0]).map(([k, val]) => [k, val == null ? "" : String(val)])
  );

  return (
    <DashboardShell user={user} title="Edit Buku" subtitle="Perbarui informasi dan stok koleksi buku.">
      <div className="mx-auto max-w-2xl py-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <BukuForm
            action={updateBuku.bind(null, bukuId)}
            categories={categories}
            initial={initial}
            submitLabel="Simpan Perubahan"
            isEdit
          />
        </div>
      </div>
    </DashboardShell>
  );
}
