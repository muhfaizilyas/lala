import Link from "next/link";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";
import HapusKategoriButton from "@/components/HapusKategoriButton";

export const metadata = { title: "Kategori Buku" };

const PESAN = {
  dibuat: "Kategori berhasil ditambahkan.",
  diubah: "Kategori berhasil diperbarui.",
  dihapus: "Kategori berhasil dihapus.",
};

export default async function KategoriPage({ searchParams }) {
  const user = await requireRole("admin");
  const { status } = await searchParams;

  // LEFT JOIN + COUNT: kategori tanpa buku tetap muncul dengan jumlah 0
  const { rows: kategori } = await pool.query(
    `SELECT c.id, c.nama, c.kode, c.deskripsi, COUNT(b.id)::int AS jumlah_buku
       FROM categories c
       LEFT JOIN books b ON b.category_id = c.id
      GROUP BY c.id
      ORDER BY c.nama`
  );

  return (
    <DashboardShell
      user={user}
      title="Kategori Buku"
      subtitle="Kelola master data kategori. Kategori yang masih memiliki buku tidak bisa dihapus."
      actions={
        <Link href="/dashboard/admin/kategori/baru" className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-slate-800">
          + Tambah Kategori
        </Link>
      }
    >
      <div className="space-y-6">
        {Object.hasOwn(PESAN, status) ? (
          <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {PESAN[status]}
          </p>
        ) : null}

        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Kode</th>
                <th className="px-5 py-3 font-semibold">Nama</th>
                <th className="px-5 py-3 font-semibold">Deskripsi</th>
                <th className="px-5 py-3 font-semibold">Jumlah Buku</th>
                <th className="px-5 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kategori.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">Belum ada kategori.</td>
                </tr>
              ) : null}
              {kategori.map((k) => (
                <tr key={k.id} className="align-top">
                  <td className="px-5 py-4 font-mono">{k.kode}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">{k.nama}</td>
                  <td className="px-5 py-4 text-slate-600">{k.deskripsi ?? "-"}</td>
                  <td className="px-5 py-4">{k.jumlah_buku}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-4">
                      <Link href={`/dashboard/admin/kategori/${k.id}/edit`} className="font-semibold text-sky-600 hover:text-sky-700">
                        Edit
                      </Link>
                      <HapusKategoriButton id={k.id} nama={k.nama} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
