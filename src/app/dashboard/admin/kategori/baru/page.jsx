import { requireRole } from "@/lib/auth";
import { createKategori } from "@/actions/kategori";
import KategoriForm from "@/components/KategoriForm";
import DashboardShell from "@/components/DashboardShell";

export const metadata = { title: "Tambah Kategori - Admin" };

export default async function KategoriBaruPage() {
  const user = await requireRole("admin");

  return (
    <DashboardShell user={user} title="Tambah Kategori" subtitle="Tambahkan kategori baru ke koleksi perpustakaan.">
      <div className="mx-auto max-w-xl py-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <KategoriForm action={createKategori} submitLabel="Simpan" />
        </div>
      </div>
    </DashboardShell>
  );
}
