import Link from "next/link";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { formatTanggal, formatRupiah } from "@/lib/format";
import DashboardShell from "@/components/DashboardShell";
import MetricCard from "@/components/MetricCard";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";

export const metadata = { title: "Dashboard Admin" };

const tombol = "rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-slate-800";

export default async function AdminDashboardPage() {
  const user = await requireRole("admin");

  const [ringkasan, peminjamanTerbaru, perKategori] = await Promise.all([
    pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM users WHERE role = 'mahasiswa') AS mahasiswa,
        (SELECT COUNT(*)::int FROM books)      AS buku,
        (SELECT COALESCE(SUM(stok_total), 0)::int FROM books) AS eksemplar,
        (SELECT COUNT(*)::int FROM loans
          WHERE status_pinjam IN ('Menunggu Konfirmasi', 'Sedang Dipinjam')) AS transaksi_aktif,
        (SELECT COALESCE(SUM(l.denda_nominal), 0) FROM loans l
          WHERE l.status_denda = 'Lunas') AS denda_lunas`),
    pool.query(`
      SELECT l.id, u.nama_lengkap, b.judul, l.status_pinjam,
             l.tanggal_pengajuan::date::text AS tanggal
        FROM loans l
        JOIN users u ON u.id = l.user_id
        JOIN books b ON b.id = l.book_id
       ORDER BY l.tanggal_pengajuan DESC, l.id DESC
       LIMIT 5`),
    pool.query(`
      SELECT c.nama, COUNT(b.id)::int AS jumlah
        FROM categories c
        LEFT JOIN books b ON b.category_id = c.id
       GROUP BY c.id
       ORDER BY jumlah DESC, c.nama`),
  ]);
  const r = ringkasan.rows[0];
  const maks = Math.max(1, ...perKategori.rows.map((k) => k.jumlah));

  const stats = [
    { label: "Total Judul Buku", value: r.buku, note: "Judul di koleksi", tone: "amber" },
    { label: "Total Eksemplar", value: r.eksemplar, note: "Jumlah stok seluruh buku", tone: "violet" },
    { label: "Mahasiswa Terdaftar", value: r.mahasiswa, note: "Semua akun mahasiswa (aktif dan nonaktif)", tone: "sky" },
    { label: "Transaksi Aktif", value: r.transaksi_aktif, note: "Menunggu + sedang dipinjam", tone: "emerald" },
    { label: "Denda Lunas", value: formatRupiah(r.denda_lunas), note: "Total denda yang sudah dibayar", tone: "rose" },
  ];

  return (
    <DashboardShell
      user={user}
      title="Dashboard Admin"
      subtitle="Ringkasan pengguna, koleksi, dan aktivitas peminjaman terbaru."
      actions={
        <>
          <Link href="/dashboard/transaksi" className={tombol}>Monitoring Transaksi</Link>
          <Link href="/dashboard/buku" className={tombol}>Kelola Buku</Link>
          <Link href="/dashboard/admin/user" className={tombol}>Kelola User</Link>
          <Link href="/dashboard/admin/kategori" className={tombol}>Kelola Kategori</Link>
          <Link href="/dashboard/pengumuman" className={tombol}>Kelola Pengumuman</Link>
          <a href="/api/transaksi/export" className={tombol}>Ekspor Transaksi (CSV)</a>
          <a
            href="/api/transaksi/export?pemisah=titik-koma"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            title="Pilih ini jika Excel membuka CSV dalam satu kolom (setelan regional Indonesia)"
          >
            CSV untuk Excel (;)
          </a>
        </>
      }
    >
      <div className="space-y-8">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map((item) => <MetricCard key={item.label} {...item} />)}
        </section>

        <section className="grid grid-cols-1 gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Peminjaman Terbaru</h2>
            <p className="mt-1 text-sm text-slate-500">Lima pengajuan terakhir dari mahasiswa.</p>
            <div className="mt-6 space-y-3">
              {peminjamanTerbaru.rows.length === 0 ? (
                <EmptyState title="Belum ada peminjaman" description="Pengajuan dari mahasiswa akan muncul di sini." />
              ) : (
                peminjamanTerbaru.rows.map((l) => (
                  <div key={l.id} className="flex flex-col gap-2 rounded-2xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{l.judul}</p>
                      <p className="text-sm text-slate-500">{l.nama_lengkap} · {formatTanggal(l.tanggal)}</p>
                    </div>
                    <StatusBadge status={l.status_pinjam} />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Buku per Kategori</h2>
            <p className="mt-1 text-sm text-slate-500">Sebaran judul di setiap kategori.</p>
            <ul className="mt-6 space-y-4">
              {perKategori.rows.map((k) => (
                <li key={k.nama}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{k.nama}</span>
                    <span className="text-slate-500">{k.jumlah} buku</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" style={{ width: `${(k.jumlah / maks) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
