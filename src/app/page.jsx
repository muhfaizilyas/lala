import Link from "next/link";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatTanggal } from "@/lib/format";
import SampulBergilir from "@/components/SampulBergilir";
import PublicShell from "@/components/PublicShell";
import SectionHeader from "@/components/SectionHeader";
import BookCard from "@/components/BookCard";
import AnnouncementCard from "@/components/AnnouncementCard";
import EmptyState from "@/components/EmptyState";

const alurPinjam = [
  {
    nomor: "1",
    judul: "Cari & cek stok",
    deskripsi: "Telusuri judul, pengarang, atau kategori di katalog dan lihat stok bebas yang tersedia.",
  },
  {
    nomor: "2",
    judul: "Ajukan atau reservasi",
    deskripsi: "Masuk sebagai mahasiswa untuk mengajukan pinjam, atau masuk antrean reservasi jika stok habis.",
  },
  {
    nomor: "3",
    judul: "Konfirmasi & pantau jadwal",
    deskripsi: "Ambil buku di meja sirkulasi setelah disetujui dan kelola perpanjangan dari dashboard.",
  },
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

  const sampulHero = populer.rows
    .filter((b) => b.stok_tersedia > 0 && b.cover_url?.trim())
    .map((b) => ({ id: b.id, judul: b.judul, src: b.cover_url.trim() }));

  return (
    <PublicShell user={user}>
      <section className="rb-hero">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
            Perpustakaan Kampus
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#0f1f3d] sm:text-5xl sm:leading-[1.08]">
            Buka buku, perluas{" "}
            <span className="text-blue-700">sudut pandang.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            RakBaca membantu mahasiswa mencari buku, mengajukan peminjaman, ikut antrean reservasi, dan memantau jatuh tempo tanpa antre di meja sirkulasi.
          </p>

          <form
            action="/katalog"
            method="GET"
            role="search"
            className="mt-7 flex flex-col gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-2 sm:flex-row sm:items-center"
          >
            <label htmlFor="hero-search" className="sr-only">
              Cari buku
            </label>
            <input
              id="hero-search"
              type="search"
              name="q"
              placeholder="Cari judul, pengarang, atau kategori..."
              className="min-w-0 flex-1 rounded-xl border border-transparent bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
            <button
              type="submit"
              className="min-h-[44px] rounded-xl bg-[#0f1f3d] px-5 py-2.5 text-sm font-semibold !text-white transition hover:bg-[#172d54]"
            >
              Cari Buku
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href="/katalog"
              className="inline-flex min-h-[44px] items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-blue-700"
            >
              Jelajahi Katalog
            </Link>
            {!user ? (
              <Link
                href="/register"
                className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#0f1f3d] transition hover:bg-slate-50"
              >
                Daftar sebagai Mahasiswa
              </Link>
            ) : null}
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-slate-600">
            <li className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-600" aria-hidden="true" />
              Cek stok real-time
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-600" aria-hidden="true" />
              Reservasi saat stok habis
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#0f1f3d]" aria-hidden="true" />
              Riwayat & jatuh tempo terpantau
            </li>
          </ul>
        </div>
        <SampulBergilir buku={sampulHero} />
      </section>

      <section id="koleksi" className="mx-auto max-w-7xl scroll-mt-24 space-y-6 px-4 pb-8 pt-14 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Katalog Populer"
          title="Buku Terpopuler"
          description="Lima buku yang paling sering dipinjam mahasiswa."
          action={
            <Link
              href="/katalog"
              className="inline-flex min-h-[40px] items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#0f1f3d] transition hover:border-blue-300 hover:text-blue-700"
            >
              Lihat semua koleksi
            </Link>
          }
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {!populer.rows.length ? (
            <div className="col-span-full">
              <EmptyState title="Koleksi belum tersedia" description="Buku akan tampil di sini setelah ditambahkan ke katalog." />
            </div>
          ) : null}
          {populer.rows.map((b) => (
            <BookCard
              key={b.id}
              id={b.id}
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

      <section id="cara-pinjam" className="mt-6 border-y border-blue-100 bg-[#eff6ff]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Alur Peminjaman"
            title="Pinjam buku dari katalog hingga meja sirkulasi"
            description="Setiap pengajuan tercatat otomatis di akun mahasiswa dan diproses petugas."
          />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {alurPinjam.map((langkah) => (
              <article
                key={langkah.nomor}
                className="rounded-2xl border border-blue-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(15,31,61,0.06)]"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f1f3d] text-xs font-bold text-white">
                  {langkah.nomor}
                </span>
                <h3 className="mt-4 text-base font-bold text-[#0f1f3d]">{langkah.judul}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">{langkah.deskripsi}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pengumuman" className="mx-auto max-w-7xl scroll-mt-24 space-y-6 px-4 pt-12 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Informasi"
          title="Pengumuman Terbaru"
          description="Kabar operasional, layanan, dan acara perpustakaan."
          action={
            <Link
              href="/pengumuman"
              className="inline-flex min-h-[40px] items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#0f1f3d] transition hover:border-blue-300 hover:text-blue-700"
            >
              Semua pengumuman
            </Link>
          }
        />
        {pengumuman.rows.length === 0 ? (
          <EmptyState title="Belum ada pengumuman" description="Pengumuman yang diterbitkan admin akan tampil di sini." />
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
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
