import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { parseId } from "@/lib/parseId";
import { requireRole } from "@/lib/auth";
import { updateKategori } from "@/actions/kategori";
import KategoriForm from "@/components/KategoriForm";
import DashboardShell from "@/components/DashboardShell";

export const metadata = { title: "Edit Kategori - Admin" };

export default async function EditKategoriPage({ params }) {
  const user = await requireRole("admin");

  const { id } = await params;
  const kategoriId = parseId(id);
  if (!kategoriId) notFound();

  const { rows } = await pool.query(
    "SELECT id, nama, kode, deskripsi FROM categories WHERE id = $1",
    [kategoriId]
  );
  if (rows.length === 0) notFound();

  return (
    <DashboardShell user={user} title="Edit Kategori" subtitle="Perbarui informasi kategori buku.">
      <div className="mx-auto max-w-xl py-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <KategoriForm
            action={updateKategori.bind(null, kategoriId)}
            initial={rows[0]}
            submitLabel="Simpan Perubahan"
          />
        </div>
      </div>
    </DashboardShell>
  );
}
