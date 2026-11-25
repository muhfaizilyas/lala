import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { parseId } from "@/lib/parseId";
import { requireRole } from "@/lib/auth";
import { updateUser } from "@/actions/user";
import UserForm from "@/components/UserForm";
import DashboardShell from "@/components/DashboardShell";

export const metadata = { title: "Edit User - Admin" };

export default async function EditUserPage({ params }) {
  const admin = await requireRole("admin");

  const { id } = await params;
  const userId = parseId(id);
  if (!userId) notFound();

  const { rows } = await pool.query(
    `SELECT id, nama_lengkap, email, nomor_identitas, role, is_active
       FROM users WHERE id = $1`,
    [userId]
  );
  if (rows.length === 0) notFound();
  const u = rows[0];

  return (
    <DashboardShell user={admin} title="Edit User" subtitle="Perbarui data akun pengguna.">
      <div className="mx-auto max-w-xl py-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <UserForm
            action={updateUser.bind(null, userId)}
            mode="edit"
            isSelf={u.id === admin.id}
            initial={{ ...u, is_active: String(u.is_active) }}
            submitLabel="Simpan Perubahan"
          />
        </div>
      </div>
    </DashboardShell>
  );
}
