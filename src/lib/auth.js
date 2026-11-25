import { cache } from "react";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { getSession } from "@/lib/session";

const HALAMAN_DASHBOARD = {
  admin: "/dashboard/admin",
  pegawai: "/dashboard/pegawai",
  mahasiswa: "/dashboard/mahasiswa",
};

export function dashboardPath(role) {
  return HALAMAN_DASHBOARD[role] ?? "/";
}

// User yang sedang login (null = Guest). Role selalu dibaca dari database,
// bukan dari cookie, jadi perubahan role / akun nonaktif langsung berlaku.
// cache() membuat query ini hanya jalan sekali per request.
//
// Sesi yang dibuat SEBELUM password terakhir diubah / direset dianggap tidak
// berlaku (perangkat lain otomatis keluar). Perbandingan memakai detik penuh
// karena iat di JWT berupa detik.
export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  const { rows } = await pool.query(
    `SELECT id, nama_lengkap, email, role,
            FLOOR(EXTRACT(EPOCH FROM password_diubah_pada))::bigint AS password_diubah_detik
       FROM users
      WHERE id = $1 AND is_active = TRUE`,
    [session.userId]
  );
  const row = rows[0];
  if (!row) return null;

  const { password_diubah_detik: diubah, ...user } = row;
  if (diubah !== null && Number(session.iat ?? 0) < Number(diubah)) return null;
  return user;
});

// Wajib login, kalau belum -> ke /login
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

// Wajib login DAN role termasuk daftar, contoh: requireRole("admin", "pegawai")
export async function requireRole(...roles) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/dashboard");
  return user;
}
