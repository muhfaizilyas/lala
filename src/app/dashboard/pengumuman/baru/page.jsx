import { requireRole } from "@/lib/auth";
import { createPengumuman } from "@/actions/pengumuman";
import PengumumanForm from "@/components/PengumumanForm";
import DashboardShell from "@/components/DashboardShell";

export const metadata = { title: "Tambah Pengumuman" };

export default async function PengumumanBaruPage() {
  const user = await requireRole("admin", "pegawai");

  // Tanggal hari ini (zona waktu Makassar) sebagai nilai awal, format YYYY-MM-DD.
  const hariIni = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Makassar" });

  return (
    <DashboardShell section="pengumuman" user={user} title="Tambah Pengumuman" subtitle="Buat pengumuman baru. Simpan sebagai Draft jika belum siap tayang.">
      <div className="mx-auto max-w-2xl py-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <PengumumanForm
            action={createPengumuman}
            initial={{ tanggal_rilis: hariIni, status: "Draft" }}
            submitLabel="Simpan"
          />
        </div>
      </div>
    </DashboardShell>
  );
}
