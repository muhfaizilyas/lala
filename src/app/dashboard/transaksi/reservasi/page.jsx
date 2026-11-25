import Link from "next/link";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { formatTanggal } from "@/lib/format";
import { sapuSemuaAntrean, HARI_AMBIL } from "@/lib/reservasi";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";

export const metadata = { title: "Antrean Reservasi" };

// Guard admin / pegawai sudah dipasang oleh dashboard/transaksi/layout.jsx,
// tapi tetap dicek di sini karena kita butuh objek user-nya.
export default async function ReservasiStafPage() {
  const user = await requireRole("admin", "pegawai");

  await sapuSemuaAntrean();

  const { rows } = await pool.query(
    `SELECT r.id, r.status, r.created_at::date::text AS dibuat,
            r.batas_ambil::text AS batas_ambil,
            u.nama_lengkap, u.nomor_identitas,
            b.judul, b.stok_tersedia,
            (SELECT COUNT(*)::int FROM reservations x
              WHERE x.book_id = r.book_id AND x.status = 'Menunggu'
                AND (x.created_at, x.id) <= (r.created_at, r.id)) AS urutan
       FROM reservations r
       JOIN users u ON u.id = r.user_id
       JOIN books b ON b.id = r.book_id
      WHERE r.status IN ('Menunggu', 'Siap Diambil')
      ORDER BY b.judul, (r.status = 'Siap Diambil') DESC, r.created_at, r.id
      LIMIT 200`
  );

  const siap = rows.filter((r) => r.status === "Siap Diambil").length;
  const menunggu = rows.length - siap;

  return (
    <DashboardShell
      user={user}
      title="Antrean Reservasi"
      subtitle="Mahasiswa yang mengantre buku yang stoknya habis (hanya lihat)."
      actions={
        <Link href="/dashboard/transaksi" className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          &larr; Transaksi
        </Link>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-3 text-sm">
          <StatusBadge tone="success">{siap} siap diambil</StatusBadge>
          <StatusBadge tone="warning">{menunggu} menunggu</StatusBadge>
        </div>
        <p className="text-sm text-slate-500">
          Saat buku dikembalikan, antrean paling awal otomatis mendapat jatah selama {HARI_AMBIL} hari.
          Eksemplar itu tidak bisa dipinjam orang lain, dan pengajuan pinjamnya diproses di menu Transaksi.
        </p>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Buku</th>
                <th className="px-5 py-3 font-semibold">Mahasiswa</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-500">Tidak ada antrean reservasi.</td>
                </tr>
              ) : null}
              {rows.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="px-5 py-4 font-semibold text-slate-900">{r.judul}</td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{r.nama_lengkap}</p>
                    <p className="font-mono text-xs text-slate-500">{r.nomor_identitas}</p>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge tone={r.status === "Siap Diambil" ? "success" : "warning"}>{r.status}</StatusBadge>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {r.status === "Siap Diambil"
                      ? `Batas ${formatTanggal(r.batas_ambil)}`
                      : `Antrean ke-${r.urutan} · daftar ${formatTanggal(r.dibuat)}`}
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
