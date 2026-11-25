import { bersihkanKeyword } from "@/lib/pencarian";
import Link from "next/link";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import AppFrame from "@/components/AppFrame";
import Ikon from "@/components/Ikon";
import { KatalogPanel } from "@/components/SectionPanels";
import { buatHref } from "@/lib/katalog";
import { parseId } from "@/lib/parseId";
import BookCover from "@/components/BookCover";
import BookDetailPanel from "@/components/BookDetailPanel";
import DetailScroll from "@/components/DetailScroll";
import { SQL_STOK_BEBAS } from "@/lib/reservasi";

export const metadata = { title: "Katalog Buku" };

// Urutan dipilih dari daftar tetap (whitelist), nilai dari URL tidak pernah
// disisipkan langsung ke SQL.
const URUTAN = {
  judul: "b.judul",
  tahun: "b.tahun_terbit DESC, b.judul",
  rating: "rating DESC NULLS LAST, b.judul",
};
const LABEL_URUTAN = { judul: "A-Z", tahun: "Terbaru", rating: "Rating" };

const KOLOM = `b.id, b.judul, b.isbn, b.pengarang, b.penerbit, b.tahun_terbit,
               ${SQL_STOK_BEBAS} AS stok_tersedia, b.durasi_maks_pinjam, b.denda_per_hari, b.cover_url,
               c.nama AS kategori, ROUND(AVG(r.rating), 1)::text AS rating`;
const DARI = `FROM books b
              JOIN categories c ON c.id = b.category_id
              LEFT JOIN loans l   ON l.book_id = b.id
              LEFT JOIN reviews r ON r.loan_id = l.id`;

export default async function KatalogPage({ searchParams }) {
  const user = await getCurrentUser();
  const { q = "", kategori = "", sort = "judul", pilih = "" } = await searchParams;

  const keyword = bersihkanKeyword(q);
  const kategoriId = parseId(kategori);
  const urutan = Object.hasOwn(URUTAN, sort) ? sort : "judul";
  const pilihId = parseId(pilih);

  const [{ rows: buku }, { rows: rekomendasi }, { rows: terpilih }] =
    await Promise.all([
      pool.query(
        `SELECT ${KOLOM}
           ${DARI}
          WHERE ($1 = ''
                 OR b.judul     ILIKE '%' || $1 || '%'
                 OR b.pengarang ILIKE '%' || $1 || '%'
                 OR c.nama      ILIKE '%' || $1 || '%')
            AND ($2::int IS NULL OR b.category_id = $2::int)
          GROUP BY b.id, c.nama
          ORDER BY ${URUTAN[urutan]}`,
        [keyword, kategoriId]
      ),
      // Rekomendasi = 3 buku paling sering dipinjam
      pool.query(
        `SELECT b.id, b.judul, b.pengarang, b.cover_url
           FROM books b
           LEFT JOIN loans l ON l.book_id = b.id
          GROUP BY b.id
          ORDER BY COUNT(l.id) DESC, b.judul
          LIMIT 3`
      ),
      pilihId
        ? pool.query(`SELECT ${KOLOM} ${DARI} WHERE b.id = $1 GROUP BY b.id, c.nama`, [pilihId])
        : Promise.resolve({ rows: [] }),
    ]);

  // Buku di panel kanan: pilihan pengguna, kalau tidak ada pakai buku pertama di daftar
  const detail = terpilih[0] ?? buku[0] ?? null;
  const konteks = { q: keyword, kategori: kategoriId, sort: urutan };

  const chip = (aktif) =>
    `inline-flex min-h-[36px] items-center rounded-full border px-3.5 py-1.5 text-xs transition ${
      aktif
        ? "border-blue-200 bg-blue-50 font-semibold text-blue-700"
        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
    }`;

  return (
    <AppFrame
      user={user}
      section="katalog"
      panel={<KatalogPanel aktif={kategoriId} q={keyword} sort={urutan} pilih={pilihId} />}
      aside={
        <DetailScroll bookId={pilihId}>
          <BookDetailPanel b={detail} />
        </DetailScroll>
      }
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Perpustakaan digital</p>
      <h1 className="my-1.5 text-[clamp(26px,3vw,36px)] font-extrabold tracking-tight text-[#0f1f3d]">Jelajahi buku</h1>
      <p className="mb-5 leading-relaxed text-slate-600">
        Temukan bacaan berikutnya dan klik buku untuk melihat ringkasan di panel detail.
      </p>

      <form
        method="GET"
        action="/katalog"
        role="search"
        className="mb-7 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-xs focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100"
      >
        {kategoriId ? <input type="hidden" name="kategori" value={kategoriId} /> : null}
        {urutan !== "judul" ? <input type="hidden" name="sort" value={urutan} /> : null}
        <label htmlFor="katalog-search" className="sr-only">
          Cari judul, pengarang, atau kategori
        </label>
        <button type="submit" aria-label="Cari" className="text-slate-500 hover:text-[#0f1f3d]">
          <Ikon nama="search" />
        </button>
        <input
          id="katalog-search"
          type="search"
          name="q"
          defaultValue={keyword}
          placeholder="Cari judul, pengarang, atau kategori..."
          className="w-full min-w-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </form>

      {!keyword && rekomendasi.length > 0 ? (
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f1f3d]">Rekomendasi</h2>
            <span className="text-xs font-medium text-slate-500">Paling sering dipinjam</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5 min-[641px]:gap-3.5">
            {rekomendasi.map((b) => (
              <Link
                key={b.id}
                scroll={false}
                href={buatHref({ ...konteks, pilih: b.id })}
                className={`block min-w-0 rounded-xl border bg-white p-2 text-left transition min-[641px]:p-3 ${
                  detail?.id === b.id
                    ? "border-blue-600 ring-2 ring-blue-100"
                    : "border-slate-200 hover:border-blue-300"
                }`}
              >
                <BookCover src={b.cover_url} judul={b.judul} id={b.id} className="w-full rounded-lg" />
                <b className="mb-0.5 mt-2.5 block text-xs font-bold text-[#0f1f3d] min-[641px]:text-sm">{b.judul}</b>
                <small className="block text-[11px] text-slate-600">{b.pengarang}</small>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold tracking-tight text-[#0f1f3d]">Katalog buku</h2>
          <span className="text-xs font-medium text-slate-500">{buku.length} judul</span>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2" aria-label="Urutan">
          <span className="mr-1 text-xs font-medium text-slate-500">Urutkan:</span>
          {Object.entries(LABEL_URUTAN).map(([kunci, label]) => (
            <Link
              key={kunci}
              scroll={false}
              href={buatHref({ q: keyword, kategori: kategoriId, sort: kunci, pilih: pilihId })}
              className={chip(urutan === kunci)}
            >
              {label}
            </Link>
          ))}
        </div>

        {buku.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Tidak ada buku yang cocok dengan pencarian Anda.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {buku.map((b) => (
              <Link
                key={b.id}
                scroll={false}
                href={buatHref({ ...konteks, pilih: b.id })}
                className={`flex items-center gap-3.5 border-b border-slate-200 px-4 py-3 transition last:border-b-0 ${
                  detail?.id === b.id ? "bg-blue-50/75" : "bg-white hover:bg-slate-50"
                }`}
              >
                <BookCover src={b.cover_url} judul={b.judul} id={b.id} compact className="w-[38px] shrink-0 rounded" />
                <span className="min-w-0">
                  <b className="block text-sm font-bold text-[#0f1f3d]">{b.judul}</b>
                  <small className="mt-0.5 block text-xs text-slate-600">{b.pengarang}</small>
                </span>
                <span className="ml-auto flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
                  {b.rating ? <span className="text-xs font-semibold text-amber-700">★ {b.rating}</span> : null}
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      b.stok_tersedia > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {b.stok_tersedia > 0 ? `Stok ${b.stok_tersedia}` : "Habis"}
                  </span>
                  <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 sm:inline">
                    {b.kategori}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppFrame>
  );
}
