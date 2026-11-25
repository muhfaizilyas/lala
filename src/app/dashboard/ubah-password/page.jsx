import { requireUser } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";
import UbahPasswordForm from "@/components/UbahPasswordForm";

export const metadata = { title: "Ubah Password" };

// Terbuka untuk semua peran yang sudah login (admin, pegawai, mahasiswa).
export default async function UbahPasswordPage() {
  const user = await requireUser();

  return (
    <DashboardShell
      user={user}
      title="Ubah Password"
      subtitle="Ganti password akunmu. Perangkat lain yang sedang masuk akan otomatis keluar."
    >
      <div className="mx-auto max-w-xl py-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <UbahPasswordForm />
        </div>
      </div>
    </DashboardShell>
  );
}
