import { bersihkanKeyword } from "@/lib/pencarian";
import Link from "next/link";
import pool from "@/lib/db";
import { parseId } from "@/lib/parseId";
import { requireRole } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";
import HapusBukuButton from "@/components/HapusBukuButton";
import StatusBadge from "@/components/StatusBadge";

export const metadata = { title: "Manajemen Buku" };

const PESAN = {
  dibuat: "Buku berhasil ditambahkan.",
  diubah: "Buku berhasil diperbarui.",
  dihapus: "Buku berhasil dihapus.",
};
const input = "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100";

export default async function BukuPage({ searchParams }) {
  const user = await requireRole("admin", "pegawai");
  const { status, q = "", kategori = "" } = await searchParams;

  const kategoriId = parseId(kategori);
  const keyword = bersihkanKeyword(q);

  const [{ rows: buku }, { rows: daftarKategori }] = await Promise.all([
    pool.query(
      `SELECT b.id, b.judul, b.isbn, b.pengarang, b.tahun_terbit,
              b.stok_total, b.stok_tersedia, c.nama AS kategori
         FROM books b
         JOIN categories c ON c.id = b.category_id
        WHERE ($1 = ''
               OR b.judul     ILIKE '%' || $1 || '%'
               OR b.pengarang ILIKE '%' || $1 || '%'
               OR b.isbn      ILIKE '%' || $1 || '%')
          AND ($2::int IS NULL OR b.category_id = $2::int)
        ORDER BY b.judul`,
      [keyword, kategoriId]
    ),
    pool.query("SELECT id, nama FROM categories ORDER BY nama"),
  ]);

  return (
    <DashboardShell
      user={user}
      title="Manajemen Buku"
      subtitle="Kelola koleksi, stok, dan data buku perpustakaan."
      actions={
        <Link href="/dashboard/buku/baru" className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-slate-800">
          + Tambah Buku
        </Link>
      }
    >
      <div className="space-y-6">
        {Object.hasOwn(PESAN, status) ? (
          <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {PESAN[status]}
          </p>
        ) : null}

        {/* Form GET biasa: hasil pencarian tercermin di URL (?q=...&kategori=...) */}
        <form method="GET" className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
          <input
            type="search"
            name="q"
            defaultValue={keyword}
            aria-label="Cari judul, pengarang, atau ISBN"
            placeholder="Cari judul, pengarang, atau ISBN"
            className={`min-w-0 flex-1 ${input}`}
          />
          <select name="kategori" defaultValue={kategoriId ?? ""} aria-label="Filter kategori" className={input}>
            <option value="">Semua kategori</option>
            {daftarKategori.map((c) => (
              <option key={c.id} value={c.id}>{c.nama}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button type="submit" className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-blue-700">
              Cari
            </button>
            {keyword || kategoriId ? (
              <Link href="/dashboard/buku" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Reset
              </Link>
            ) : null}
          </div>
        </form>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Judul</th>
                <th className="px-5 py-3 font-semibold">Pengarang</th>
                <th className="px-5 py-3 font-semibold">Kategori</th>
                <th className="px-5 py-3 font-semibold">Tahun</th>
                <th className="px-5 py-3 font-semibold">Stok</th>
                <th className="px-5 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {buku.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">Tidak ada buku yang cocok.</td>
                </tr>
              ) : null}
              {buku.map((b) => (
                <tr key={b.id} className="align-top">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{b.judul}</p>
                    <p className="font-mono text-xs text-slate-500">{b.isbn}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-700">{b.pengarang}</td>
                  <td className="px-5 py-4 text-slate-700">{b.kategori}</td>
                  <td className="px-5 py-4 text-slate-700">{b.tahun_terbit}</td>
                  <td className="px-5 py-4">
                    <StatusBadge tone={b.stok_tersedia > 0 ? "success" : "danger"}>
                      {b.stok_tersedia} / {b.stok_total}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-4">
                      <Link href={`/dashboard/buku/${b.id}/edit`} className="font-semibold text-sky-600 hover:text-sky-700">
                        Edit
                      </Link>
                      <HapusBukuButton id={b.id} judul={b.judul} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">Stok: tersedia / total.</p>
      </div>
    </DashboardShell>
  );
}
