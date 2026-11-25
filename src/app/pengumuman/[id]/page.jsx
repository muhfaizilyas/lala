import Link from "next/link";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { parseId } from "@/lib/parseId";
import { getCurrentUser } from "@/lib/auth";
import { formatTanggal } from "@/lib/format";
import AppFrame from "@/components/AppFrame";
import { PengumumanPanel } from "@/components/SectionPanels";
import StatusBadge from "@/components/StatusBadge";

async function ambilPengumuman(id) {
  const { rows } = await pool.query(
    `SELECT a.id, a.judul, a.konten, a.kategori, a.status,
            a.tanggal_rilis::text AS tanggal, u.nama_lengkap AS penulis
       FROM announcements a
       LEFT JOIN users u ON u.id = a.created_by
      WHERE a.id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const pengumumanId = parseId(id);
  if (!pengumumanId) return { title: "Pengumuman tidak ditemukan" };
  const p = await ambilPengumuman(pengumumanId);
  return { title: p?.status === "Published" ? p.judul : "Pengumuman" };
}

export default async function DetailPengumumanPage({ params }) {
  const { id } = await params;
  const pengumumanId = parseId(id);
  if (!pengumumanId) notFound();

  const [user, p] = await Promise.all([getCurrentUser(), ambilPengumuman(pengumumanId)]);
  if (!p) notFound();

  // Draft hanya boleh dilihat admin/pegawai (pratinjau). Selain itu dianggap tidak ada.
  const staf = user?.role === "admin" || user?.role === "pegawai";
  if (p.status !== "Published" && !staf) notFound();

  return (
    <AppFrame
      user={user}
      section="pengumuman"
      panel={<PengumumanPanel user={user} />}
      title="Pengumuman"
      subtitle="Informasi resmi dari perpustakaan kampus."
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/pengumuman" className="text-sm font-semibold text-sky-600 hover:text-sky-700">
          &larr; Semua pengumuman
        </Link>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">{p.kategori}</span>
            {p.status !== "Published" ? <StatusBadge status={p.status} /> : null}
          </div>
          <h1 className="mt-3 break-words text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{p.judul}</h1>
          <p className="mt-2 text-sm text-slate-500">
            Dirilis {formatTanggal(p.tanggal)}
            {p.penulis ? ` · oleh ${p.penulis}` : ""}
          </p>
          {p.status !== "Published" ? (
            <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Ini pratinjau draft. Pengumuman belum tampil di halaman publik.
            </p>
          ) : null}
          <div className="mt-6 whitespace-pre-line break-words text-base leading-7 text-slate-700">{p.konten}</div>
        </article>
      </div>
    </AppFrame>
  );
}
