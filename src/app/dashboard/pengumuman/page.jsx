import { bersihkanKeyword } from "@/lib/pencarian";
import Link from "next/link";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { formatTanggal } from "@/lib/format";
import { STATUS_PENGUMUMAN } from "@/lib/validation";
import DashboardShell from "@/components/DashboardShell";
import HapusPengumumanButton from "@/components/HapusPengumumanButton";
import StatusBadge from "@/components/StatusBadge";

export const metadata = { title: "Manajemen Pengumuman" };

const PESAN = {
  dibuat: "Pengumuman berhasil ditambahkan.",
  diubah: "Pengumuman berhasil diperbarui.",
  dihapus: "Pengumuman berhasil dihapus.",
};
const input =
  "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100";

export default async function PengumumanAdminPage({ searchParams }) {
  const user = await requireRole("admin", "pegawai");
  const { status, q = "", publikasi = "" } = await searchParams;

  const keyword = bersihkanKeyword(q);
  // Nilai filter dari URL dicek ke daftar tetap sebelum dipakai di query.
  const filterStatus = STATUS_PENGUMUMAN.includes(publikasi) ? publikasi : "";

  const { rows: pengumuman } = await pool.query(
    `SELECT a.id, a.judul, a.kategori, a.status,
            a.tanggal_rilis::text AS tanggal, u.nama_lengkap AS penulis
       FROM announcements a
       LEFT JOIN users u ON u.id = a.created_by
      WHERE ($1 = '' OR a.judul ILIKE '%' || $1 || '%')
        AND ($2 = '' OR a.status = $2)
      ORDER BY a.tanggal_rilis DESC, a.id DESC`,
    [keyword, filterStatus]
  );

  return (
    <DashboardShell section="pengumuman"
      user={user}
      title="Manajemen Pengumuman"
      subtitle="Kelola pengumuman operasional, layanan, dan acara perpustakaan."
      actions={
        <Link href="/dashboard/pengumuman/baru" className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-slate-800">
          + Tambah Pengumuman
        </Link>
      }
    >
      <div className="space-y-6">
        {Object.hasOwn(PESAN, status) ? (
          <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {PESAN[status]}
          </p>
        ) : null}

        <form method="GET" className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
          <input
            type="search"
            name="q"
            defaultValue={keyword}
            aria-label="Cari judul pengumuman"
            placeholder="Cari judul pengumuman..."
            className={`${input} min-w-0 flex-1`}
          />
          <select name="publikasi" defaultValue={filterStatus} aria-label="Filter status" className={input}>
            <option value="">Semua status</option>
            {STATUS_PENGUMUMAN.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button type="submit" className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-blue-700">
            Terapkan
          </button>
          {(keyword || filterStatus) && (
            <Link href="/dashboard/pengumuman" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Reset
            </Link>
          )}
        </form>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Judul</th>
                <th className="px-5 py-3 font-semibold">Kategori</th>
                <th className="px-5 py-3 font-semibold">Tanggal rilis</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Penulis</th>
                <th className="px-5 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pengumuman.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">Belum ada pengumuman.</td>
                </tr>
              ) : null}
              {pengumuman.map((p) => (
                <tr key={p.id} className="align-top">
                  <td className="px-5 py-4 font-semibold text-slate-900">{p.judul}</td>
                  <td className="px-5 py-4 text-slate-600">{p.kategori}</td>
                  <td className="px-5 py-4 text-slate-600">{formatTanggal(p.tanggal)}</td>
                  <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-4 text-slate-600">{p.penulis ?? "-"}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-4">
                      <Link href={`/pengumuman/${p.id}`} className="font-semibold text-slate-600 hover:text-slate-900">
                        Lihat
                      </Link>
                      <Link href={`/dashboard/pengumuman/${p.id}/edit`} className="font-semibold text-sky-600 hover:text-sky-700">
                        Edit
                      </Link>
                      <HapusPengumumanButton id={p.id} judul={p.judul} />
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
