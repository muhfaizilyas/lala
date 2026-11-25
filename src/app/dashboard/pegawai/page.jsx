import Link from "next/link";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { formatTanggal, formatRupiah } from "@/lib/format";
import DashboardShell from "@/components/DashboardShell";
import MetricCard from "@/components/MetricCard";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import AksiForm from "@/components/AksiForm";
import { setujuiPinjam, tolakPinjam } from "@/actions/peminjaman";

export const metadata = { title: "Dashboard Pegawai" };

export default async function PegawaiDashboardPage() {
  const user = await requireRole("pegawai");

  const [ringkasan, antrian, terlambat] = await Promise.all([
    pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status_pinjam = 'Menunggu Konfirmasi')::int AS menunggu,
        COUNT(*) FILTER (WHERE status_pinjam = 'Sedang Dipinjam')::int     AS dipinjam,
        COUNT(*) FILTER (WHERE status_pinjam = 'Sedang Dipinjam'
                           AND tanggal_jatuh_tempo < CURRENT_DATE)::int    AS terlambat,
        COALESCE(SUM(denda_nominal) FILTER (WHERE status_denda = 'Tertunggak'), 0) AS denda
      FROM loans`),
    pool.query(`
      SELECT l.id, u.nama_lengkap, b.judul, l.tanggal_pengajuan::date::text AS tanggal
        FROM loans l
        JOIN users u ON u.id = l.user_id
        JOIN books b ON b.id = l.book_id
       WHERE l.status_pinjam = 'Menunggu Konfirmasi'
       ORDER BY l.tanggal_pengajuan, l.id
       LIMIT 5`),
    pool.query(`
      SELECT l.id, u.nama_lengkap, b.judul,
             l.tanggal_jatuh_tempo::text AS jatuh_tempo,
             (CURRENT_DATE - l.tanggal_jatuh_tempo)::int AS hari_terlambat
        FROM loans l
        JOIN users u ON u.id = l.user_id
        JOIN books b ON b.id = l.book_id
       WHERE l.status_pinjam = 'Sedang Dipinjam' AND l.tanggal_jatuh_tempo < CURRENT_DATE
       ORDER BY l.tanggal_jatuh_tempo
       LIMIT 5`),
  ]);
  const r = ringkasan.rows[0];

  const stats = [
    { label: "Pengajuan Baru", value: r.menunggu, note: "Menunggu konfirmasi", tone: "sky" },
    { label: "Sedang Dipinjam", value: r.dipinjam, note: "Transaksi aktif", tone: "emerald" },
    { label: "Terlambat", value: r.terlambat, note: "Melewati jatuh tempo", tone: "amber" },
    { label: "Denda Tertunggak", value: formatRupiah(r.denda), note: "Belum dilunasi", tone: "rose" },
  ];

  return (
    <DashboardShell
      user={user}
      title="Dashboard Pegawai"
      subtitle="Pantau pengajuan, peminjaman aktif, dan keterlambatan."
      actions={
        <>
          <Link href="/dashboard/transaksi" className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-slate-800">
            Proses Transaksi
          </Link>
          <Link href="/dashboard/buku" className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-slate-800">
            Kelola Buku
          </Link>
          <Link href="/dashboard/pengumuman" className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-slate-800">
            Kelola Pengumuman
          </Link>
        </>
      }
    >
      <div className="space-y-8">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => <MetricCard key={item.label} {...item} />)}
        </section>

        <section className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Antrian Pengajuan</h2>
                <p className="mt-1 text-sm text-slate-500">Pengajuan pinjam tertua yang belum diproses. Setujui atau tolak langsung dari sini.</p>
              </div>
              <Link href="/dashboard/transaksi?tab=antrean">
                <StatusBadge tone="warning">{r.menunggu} menunggu · proses &rarr;</StatusBadge>
              </Link>
            </div>
            <div className="mt-6 space-y-3">
              {antrian.rows.length === 0 ? (
                <EmptyState title="Antrian kosong" description="Tidak ada pengajuan yang menunggu konfirmasi." />
              ) : (
                antrian.rows.map((l) => (
                  <div key={l.id} className="space-y-3 rounded-2xl bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-semibold text-slate-900">{l.nama_lengkap}</p>
                      <p className="text-sm text-slate-500">{l.judul} · diajukan {formatTanggal(l.tanggal)}</p>
                    </div>
                    <div className="flex flex-wrap items-start gap-2">
                      <AksiForm action={setujuiPinjam} id={l.id} label="Setujui" variant="success" />
                      <AksiForm action={tolakPinjam} id={l.id} label="Tolak" variant="danger" alasan alasanPlaceholder="Alasan penolakan" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Peminjaman Terlambat</h2>
                <p className="mt-1 text-sm text-slate-500">Buku yang melewati batas pengembalian.</p>
              </div>
              <Link href="/dashboard/transaksi?tab=dipinjam">
                <StatusBadge tone="danger">{r.terlambat} terlambat · kelola &rarr;</StatusBadge>
              </Link>
            </div>
            <div className="mt-6 space-y-3">
              {terlambat.rows.length === 0 ? (
                <EmptyState title="Tidak ada keterlambatan" description="Semua peminjaman aktif masih dalam batas waktu." />
              ) : (
                terlambat.rows.map((l) => (
                  <div key={l.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{l.nama_lengkap}</p>
                      <p className="truncate text-sm text-slate-500">{l.judul} · jatuh tempo {formatTanggal(l.jatuh_tempo)}</p>
                    </div>
                    <StatusBadge tone="danger">{l.hari_terlambat} hari</StatusBadge>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
