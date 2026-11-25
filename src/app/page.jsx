import Link from "next/link";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatTanggal } from "@/lib/format";
import SampulBergilir from "@/components/SampulBergilir";
import PublicShell from "@/components/PublicShell";
import SectionHeader from "@/components/SectionHeader";
import InfoCard from "@/components/InfoCard";
import BookCard from "@/components/BookCard";
import AnnouncementCard from "@/components/AnnouncementCard";
import EmptyState from "@/components/EmptyState";

const fitur = [
  ["Katalog online", "Cari buku berdasarkan judul, pengarang, atau kategori dan cek stok secara langsung.", "▤"],
  ["Pinjam & perpanjang", "Ajukan peminjaman dan perpanjangan, lalu pantau statusnya dari dashboard.", "▣"],
  ["Denda transparan", "Denda keterlambatan dihitung otomatis dan bisa dilihat kapan saja.", "▦"],
];

export default async function Home() {
  const user = await getCurrentUser();

  const [populer, pengumuman] = await Promise.all([
    // 5 buku paling sering dipinjam: JOIN + COUNT
    pool.query(`
      SELECT b.id, b.judul, b.pengarang, b.stok_tersedia, b.cover_url, c.nama AS kategori,
             COUNT(DISTINCT l.id)::int AS jumlah_pinjam,
             ROUND(AVG(r.rating), 1)::text AS rating
        FROM books b
        JOIN categories c ON c.id = b.category_id
        LEFT JOIN loans l   ON l.book_id = b.id AND l.status_pinjam IN ('Sedang Dipinjam', 'Selesai')
        LEFT JOIN reviews r ON r.loan_id = l.id
       GROUP BY b.id, c.nama
       ORDER BY jumlah_pinjam DESC, b.judul
       LIMIT 5`),
    // Hanya yang berstatus Published
    pool.query(`
      SELECT id, judul, kategori, tanggal_rilis::text AS tanggal, LEFT(konten, 160) AS ringkasan
        FROM announcements
       WHERE status = 'Published'
       ORDER BY tanggal_rilis DESC, id DESC
       LIMIT 3`),
  ]);

  return (
    <PublicShell user={user}>
      <section className="rb-hero">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">Perpustakaan Kampus</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Buku baru,<br /><em>sudut pandang baru.</em>
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            RakBaca membantu mahasiswa mencari buku, mengajukan peminjaman, dan memantau jatuh tempo tanpa antre di meja sirkulasi.
          </p>

          <form action="/katalog" method="GET" className="mt-8 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row">
            <input
              type="search"
              name="q"
              aria-label="Cari buku"
              placeholder="Cari judul, pengarang, atau kategori..."
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
            />
            <button type="submit" className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold !text-white transition hover:bg-blue-700">
              Cari Buku
            </button>
          </form>

          {!user && (
            <div className="mt-5 text-sm">
              <Link href="/register" className="font-semibold text-slate-600 hover:text-slate-900">Daftar sebagai mahasiswa</Link>
            </div>
          )}
        </div>
        <SampulBergilir buku={populer.rows.filter(b => b.stok_tersedia > 0 && b.cover_url?.trim()).map(b => ({ id: b.id, judul: b.judul, src: b.cover_url.trim() }))} />
      </section>

      <section id="fitur" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {fitur.map(([title, description, icon]) => (
            <InfoCard key={title} title={title} description={description} icon={icon} />
          ))}
        </div>
      </section>

      <section id="koleksi" className="mx-auto max-w-7xl scroll-mt-24 space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Koleksi"
          title="Buku Terpopuler"
          description="Lima buku yang paling sering dipinjam mahasiswa."
          action={<Link href="/katalog" className="text-sm font-semibold text-sky-600 hover:text-sky-700">Lihat semua</Link>}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {!populer.rows.length && <div className="col-span-full"><EmptyState title="Koleksi belum tersedia" description="Buku akan tampil di sini setelah ditambahkan ke katalog." /></div>}
          {populer.rows.map((b) => (
            <BookCard
              key={b.id}
              judul={b.judul}
              pengarang={b.pengarang}
              kategori={b.kategori}
              stok_tersedia={b.stok_tersedia}
              cover_url={b.cover_url}
              rating={b.rating}
              href={`/buku/${b.id}`}
            />
          ))}
        </div>
      </section>

      <section id="pengumuman" className="mx-auto max-w-7xl scroll-mt-24 space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Informasi"
          title="Pengumuman Terbaru"
          description="Kabar operasional, layanan, dan acara perpustakaan."
          action={<Link href="/pengumuman" className="text-sm font-semibold text-sky-600 hover:text-sky-700">Lihat semua</Link>}
        />
        {pengumuman.rows.length === 0 ? (
          <EmptyState title="Belum ada pengumuman" description="Pengumuman yang diterbitkan admin akan tampil di sini." />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {pengumuman.rows.map((p) => (
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
      </section>
    </PublicShell>
  );
}
