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
const LABEL_URUTAN = { judul: "A–Z", tahun: "Terbaru", rating: "Rating" };

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
    `rounded-full border px-3 py-1.5 text-xs ${
      aktif
        ? "border-[#e8efff] bg-[#e8efff] font-semibold text-[#2453bd]"
        : "border-[#dce1eb] bg-white hover:bg-[#f4f5f9]"
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
      <p className="text-[10px] font-bold uppercase tracking-[1.7px] text-[#69758b]">Perpustakaan digital</p>
      <h1 className="my-1.5 text-[clamp(25px,3vw,38px)] font-bold tracking-[-0.04em]">Jelajahi buku</h1>
      <p className="mb-5 leading-relaxed text-[#667185]">
        Temukan bacaan berikutnya untuk menemani harimu.
      </p>

      <form
        method="GET"
        action="/katalog"
        role="search"
        className="mb-7 flex items-center gap-2.5 rounded-xl border border-[#e3e6ed] bg-white px-3.5 py-2.5 focus-within:border-[#5789ed] focus-within:ring-4 focus-within:ring-[#e4ecff]"
      >
        {kategoriId ? <input type="hidden" name="kategori" value={kategoriId} /> : null}
        {urutan !== "judul" ? <input type="hidden" name="sort" value={urutan} /> : null}
        <button type="submit" aria-label="Cari" className="text-[#4b5870]">
          <Ikon nama="search" />
        </button>
        <input
          type="search"
          name="q"
          defaultValue={keyword}
          aria-label="Cari judul, pengarang, atau kategori"
          placeholder="Cari judul, pengarang, atau kategori..."
          className="w-full min-w-0 bg-transparent text-sm outline-none"
        />
      </form>

      {!keyword && rekomendasi.length > 0 ? (
        <section className="mb-7">
          <div className="flex items-center justify-between gap-2">
            <h2 className="my-3 text-[19px] font-bold tracking-tight">Rekomendasi</h2>
            <span className="text-[11px] text-[#647089]">Paling sering dipinjam</span>
          </div>
          <div className="grid grid-cols-3 gap-[7px] min-[641px]:gap-[13px]">
            {rekomendasi.map((b) => (
              <Link
                key={b.id}
                scroll={false}
                href={buatHref({ ...konteks, pilih: b.id })}
                className={`block min-w-0 rounded-[10px] border bg-white p-1.5 text-left min-[641px]:p-[9px] ${
                  detail?.id === b.id ? "border-[#456ee0]" : "border-[#e3e6ed]"
                }`}
              >
                <BookCover src={b.cover_url} judul={b.judul} id={b.id} className="w-full" />
                <b className="mb-0.5 mt-2 block text-xs min-[641px]:text-sm">{b.judul}</b>
                <small className="block text-[11px] text-[#637084]">{b.pengarang}</small>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="flex items-center justify-between gap-2">
          <h2 className="my-3 text-[19px] font-bold tracking-tight">Katalog buku</h2>
          <span className="text-[11px] text-[#647089]">{buku.length} judul</span>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-1.5" aria-label="Urutan">
          <span className="mr-1 text-[11px] text-[#647089]">Urutkan:</span>
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
          <p className="rounded-lg bg-white p-3.5">Tidak ada buku yang cocok.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-[#e6e9ef]">
            {buku.map((b) => (
              <Link
                key={b.id}
                scroll={false}
                href={buatHref({ ...konteks, pilih: b.id })}
                className={`flex items-center gap-3 border-b border-[#e6e9ef] px-[13px] py-2.5 last:border-b-0 ${
                  detail?.id === b.id ? "bg-[#f3f6ff]" : "bg-white hover:bg-[#fafbfe]"
                }`}
              >
                <BookCover src={b.cover_url} judul={b.judul} id={b.id} compact className="w-[34px] shrink-0" />
                <span className="min-w-0">
                  <b className="block text-sm">{b.judul}</b>
                  <small className="mt-0.5 block text-[11px] text-[#637084]">{b.pengarang}</small>
                </span>
                <span className="ml-auto flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
                  {b.rating ? <span className="text-[11px] font-medium text-amber-600">★ {b.rating}</span> : null}
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] ${
                      b.stok_tersedia > 0 ? "bg-[#edf6f0] text-[#336546]" : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {b.stok_tersedia > 0 ? `Stok ${b.stok_tersedia}` : "Habis"}
                  </span>
                  <span className="hidden rounded-full bg-[#eef1f7] px-2 py-1 text-[10px] text-[#4b5870] sm:inline">
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
