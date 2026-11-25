import { requireRole } from "@/lib/auth";
import { createUser } from "@/actions/user";
import UserForm from "@/components/UserForm";
import DashboardShell from "@/components/DashboardShell";

export const metadata = { title: "Tambah User - Admin" };

export default async function UserBaruPage() {
  const user = await requireRole("admin");

  return (
    <DashboardShell user={user} title="Tambah User" subtitle="Buat akun baru untuk Admin, Pegawai, atau Mahasiswa.">
      <div className="mx-auto max-w-xl py-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <UserForm action={createUser} mode="baru" initial={{ role: "mahasiswa" }} submitLabel="Simpan" />
        </div>
      </div>
    </DashboardShell>
  );
}
