import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatTanggal } from "@/lib/format";
import { KATEGORI_PENGUMUMAN } from "@/lib/validation";
import AppFrame from "@/components/AppFrame";
import { PengumumanPanel } from "@/components/SectionPanels";
import AnnouncementCard from "@/components/AnnouncementCard";
import EmptyState from "@/components/EmptyState";

export const metadata = { title: "Pengumuman" };

export default async function DaftarPengumumanPage({ searchParams }) {
  const user = await getCurrentUser();
  const { kategori = "" } = await searchParams;
  const filter = KATEGORI_PENGUMUMAN.includes(kategori) ? kategori : "";

  // Hanya yang berstatus Published yang boleh tampil di halaman publik.
  const { rows } = await pool.query(
    `SELECT id, judul, kategori, tanggal_rilis::text AS tanggal, LEFT(konten, 160) AS ringkasan
       FROM announcements
      WHERE status = 'Published' AND ($1 = '' OR kategori = $1)
      ORDER BY tanggal_rilis DESC, id DESC`,
    [filter]
  );

  return (
    <AppFrame
      user={user}
      section="pengumuman"
      panel={<PengumumanPanel user={user} aktif={filter} />}
      title="Pengumuman"
      subtitle="Kabar operasional, layanan, dan acara perpustakaan."
    >
      <div className="space-y-6">
        {rows.length === 0 ? (
          <EmptyState title="Belum ada pengumuman" description="Pengumuman yang sudah diterbitkan akan tampil di sini." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((p) => (
              <AnnouncementCard
                key={p.id}
                hideStatus
                href={`/pengumuman/${p.id}`}
                judul={p.judul}
                kategori={p.kategori}
                ringkasan={p.ringkasan}
                date={formatTanggal(p.tanggal)}
              />
            ))}
          </div>
        )}
      </div>
    </AppFrame>
  );
}
