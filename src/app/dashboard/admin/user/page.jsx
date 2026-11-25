import { bersihkanKeyword } from "@/lib/pencarian";
import Link from "next/link";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { formatTanggal } from "@/lib/format";
import { ROLE_USER } from "@/lib/validation";
import { ROLE_LABEL } from "@/lib/navigation";
import DashboardShell from "@/components/DashboardShell";
import HapusUserButton from "@/components/HapusUserButton";
import StatusBadge from "@/components/StatusBadge";

export const metadata = { title: "Manajemen User" };

const PESAN = {
  dibuat: "User berhasil ditambahkan.",
  diubah: "User berhasil diperbarui.",
  dihapus: "User berhasil dihapus.",
};
const TONE_ROLE = { admin: "info", pegawai: "warning", mahasiswa: "neutral" };
const input =
  "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100";

export default async function UserPage({ searchParams }) {
  const admin = await requireRole("admin");
  const { status, q = "", role = "" } = await searchParams;

  const keyword = bersihkanKeyword(q);
  // Nilai filter dari URL dicek ke daftar tetap sebelum dipakai di query.
  const filterRole = ROLE_USER.includes(role) ? role : "";

  const { rows: users } = await pool.query(
    `SELECT id, nama_lengkap, email, nomor_identitas, role, is_active,
            created_at::date::text AS terdaftar
       FROM users
      WHERE ($1 = '' OR nama_lengkap ILIKE '%' || $1 || '%'
                     OR email ILIKE '%' || $1 || '%'
                     OR nomor_identitas ILIKE '%' || $1 || '%')
        AND ($2 = '' OR role = $2)
      ORDER BY CASE role WHEN 'admin' THEN 1 WHEN 'pegawai' THEN 2 ELSE 3 END,
               nama_lengkap`,
    [keyword, filterRole]
  );

  return (
    <DashboardShell
      user={admin}
      title="Manajemen User"
      subtitle="Kelola akun Admin, Pegawai, dan Mahasiswa."
      actions={
        <Link href="/dashboard/admin/user/baru" className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-slate-800">
          + Tambah User
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
            aria-label="Cari nama, email, atau nomor identitas"
            placeholder="Cari nama, email, atau NIM/NIP..."
            className={`${input} min-w-0 flex-1`}
          />
          <select name="role" defaultValue={filterRole} aria-label="Filter role" className={input}>
            <option value="">Semua role</option>
            {ROLE_USER.map((r) => (
              <option key={r} value={r}>{ROLE_LABEL[r]}</option>
            ))}
          </select>
          <button type="submit" className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-blue-700">
            Terapkan
          </button>
          {(keyword || filterRole) && (
            <Link href="/dashboard/admin/user" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Reset
            </Link>
          )}
        </form>

        <p className="text-sm text-slate-500">{users.length} user ditemukan</p>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Nama</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">NIM / NIP</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Terdaftar</th>
                <th className="px-5 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500">Tidak ada user yang cocok.</td>
                </tr>
              ) : null}
              {users.map((u) => {
                const diriSendiri = u.id === admin.id;
                return (
                  <tr key={u.id} className="align-top">
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {u.nama_lengkap}
                      {diriSendiri ? <span className="ml-2 text-xs font-medium text-slate-400">(Kamu)</span> : null}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{u.email}</td>
                    <td className="px-5 py-4 font-mono text-slate-600">{u.nomor_identitas}</td>
                    <td className="px-5 py-4"><StatusBadge tone={TONE_ROLE[u.role]}>{ROLE_LABEL[u.role]}</StatusBadge></td>
                    <td className="px-5 py-4">
                      <StatusBadge tone={u.is_active ? "success" : "danger"}>{u.is_active ? "Aktif" : "Nonaktif"}</StatusBadge>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{formatTanggal(u.terdaftar)}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-4">
                        <Link href={`/dashboard/admin/user/${u.id}/edit`} className="font-semibold text-sky-600 hover:text-sky-700">
                          Edit
                        </Link>
                        {diriSendiri ? null : <HapusUserButton id={u.id} nama={u.nama_lengkap} />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
