import Link from "next/link";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { parseId } from "@/lib/parseId";
import { getCurrentUser } from "@/lib/auth";
import { formatTanggal, formatRupiah } from "@/lib/format";
import DetailShell from "@/components/DetailShell";
import StatusBadge from "@/components/StatusBadge";
import CoverImage from "@/components/CoverImage";
import EmptyState from "@/components/EmptyState";
import AksiForm from "@/components/AksiForm";
import { ajukanPinjam } from "@/actions/peminjaman";
import { buatReservasi, batalkanReservasi } from "@/actions/reservasi";
import { sapuBukuMandiri, SQL_DICADANGKAN } from "@/lib/reservasi";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const bukuId = parseId(id);
  if (!bukuId) return { title: "Buku tidak ditemukan" };
  const { rows } = await pool.query("SELECT judul FROM books WHERE id = $1", [bukuId]);
  return { title: rows[0]?.judul ?? "Buku tidak ditemukan" };
}

export default async function DetailBukuPage({ params }) {
  const { id } = await params;
  const bukuId = parseId(id);
  if (!bukuId) notFound();

  const user = await getCurrentUser();

  // Rapikan antrean reservasi (kedaluwarsa / giliran berikutnya) sebelum menampilkan stok.
  await sapuBukuMandiri(bukuId);

  const [buku, ulasan] = await Promise.all([
    pool.query(
      `SELECT b.id, b.judul, b.isbn, b.pengarang, b.penerbit, b.tahun_terbit,
              b.stok_total, b.stok_tersedia, b.durasi_maks_pinjam, b.denda_per_hari, b.cover_url,
              ${SQL_DICADANGKAN} AS dicadangkan,
              (SELECT COUNT(*)::int FROM reservations rv
                WHERE rv.book_id = b.id AND rv.status = 'Menunggu') AS antrean,
              c.nama AS kategori
         FROM books b JOIN categories c ON c.id = b.category_id
        WHERE b.id = $1`,
      [bukuId]
    ),
    pool.query(
      `SELECT r.id, r.rating, r.komentar, r.created_at::date::text AS tanggal, u.nama_lengkap
         FROM reviews r
         JOIN loans l ON l.id = r.loan_id
         JOIN users u ON u.id = l.user_id
        WHERE l.book_id = $1
        ORDER BY r.created_at DESC`,
      [bukuId]
    ),
  ]);
  if (buku.rows.length === 0) notFound();

  const b = buku.rows[0];
  // Stok yang benar-benar bisa dipinjam = stok tersedia dikurangi yang dicadangkan untuk antrean.
  const stokBebas = Math.max(b.stok_tersedia - b.dicadangkan, 0);
  const reviews = ulasan.rows;
  const rataRata = reviews.length
    ? (reviews.reduce((jumlah, r) => jumlah + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  // Status khusus mahasiswa: diblokir denda? sudah punya pengajuan/pinjaman aktif untuk buku ini?
  let status = { diblokir: false, telat: false, aktif: false, reservasi: null };
  if (user?.role === "mahasiswa") {
    const { rows } = await pool.query(
      `SELECT
         EXISTS (SELECT 1 FROM loans WHERE user_id = $1 AND status_denda = 'Tertunggak') AS diblokir,
         EXISTS (SELECT 1 FROM loans WHERE user_id = $1 AND status_pinjam = 'Sedang Dipinjam'
                  AND tanggal_jatuh_tempo < CURRENT_DATE) AS telat,
         EXISTS (SELECT 1 FROM loans WHERE user_id = $1 AND book_id = $2
                  AND status_pinjam IN ('Menunggu Konfirmasi', 'Sedang Dipinjam')) AS aktif`,
      [user.id, bukuId]
    );
    status = { ...rows[0], reservasi: null };

    // Reservasi aktif milik mahasiswa ini untuk buku ini (kalau ada), lengkap dengan urutan antrean.
    const { rows: rsv } = await pool.query(
      `SELECT r.id, r.status, r.batas_ambil::text AS batas_ambil,
              (SELECT COUNT(*)::int FROM reservations x
                WHERE x.book_id = r.book_id AND x.status = 'Menunggu'
                  AND (x.created_at, x.id) <= (r.created_at, r.id)) AS urutan
         FROM reservations r
        WHERE r.user_id = $1 AND r.book_id = $2 AND r.status IN ('Menunggu', 'Siap Diambil')`,
      [user.id, bukuId]
    );
    status.reservasi = rsv[0] ?? null;
  }

  const info = [
    ["ISBN", b.isbn],
    ["Pengarang", b.pengarang],
    ["Penerbit", b.penerbit],
    ["Tahun terbit", b.tahun_terbit],
    ["Kategori", b.kategori],
    ["Durasi maks. pinjam", `${b.durasi_maks_pinjam} hari`],
    ["Denda per hari", formatRupiah(b.denda_per_hari)],
  ];

  return (
    <DetailShell user={user} title="Detail Buku" subtitle="Informasi lengkap, ketersediaan, dan ulasan pembaca.">
      <div className="space-y-8">
        <Link href="/katalog" className="text-sm font-semibold text-sky-600 hover:text-sky-700">
          &larr; Kembali ke katalog
        </Link>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="relative flex min-h-64 flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-6 text-white shadow-sm">
            <CoverImage src={b.cover_url} alt={`Sampul ${b.judul}`} />
            <div className="relative"><StatusBadge status={stokBebas > 0 ? "Tersedia" : "Stok habis"} /></div>
            <div className="relative">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/75">RakBaca</p>
              <h2 className="mt-2 break-words text-2xl font-black leading-tight">{b.judul}</h2>
              <p className="mt-1 text-sm text-white/85">{b.pengarang}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge tone={stokBebas > 0 ? "success" : "danger"}>
                Stok tersedia {stokBebas} dari {b.stok_total}
              </StatusBadge>
              {b.dicadangkan > 0 ? (
                <StatusBadge tone="warning">{b.dicadangkan} dicadangkan untuk antrean</StatusBadge>
              ) : null}
              {b.antrean > 0 ? (
                <span className="text-sm text-slate-500">{b.antrean} orang mengantre</span>
              ) : null}
              {rataRata ? (
                <span className="text-sm font-semibold text-amber-600">★ {rataRata} ({reviews.length} ulasan)</span>
              ) : (
                <span className="text-sm text-slate-500">Belum ada ulasan</span>
              )}
            </div>
            <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {info.map(([label, nilai]) => (
                <div key={label}>
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">{nilai}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 border-t border-slate-100 pt-5">
              {!user ? (
                <p className="text-sm text-slate-600">
                  <Link href="/login" className="font-semibold text-sky-600 hover:text-sky-700">Masuk</Link> atau{" "}
                  <Link href="/register" className="font-semibold text-sky-600 hover:text-sky-700">daftar sebagai mahasiswa</Link>{" "}
                  untuk mengajukan peminjaman.
                </p>
              ) : user.role !== "mahasiswa" ? (
                <p className="text-sm text-slate-500">Peminjaman hanya tersedia untuk akun mahasiswa.</p>
              ) : status.diblokir ? (
                <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  Pengajuan pinjam diblokir karena kamu masih punya denda tertunggak.
                </p>
              ) : status.aktif ? (
                <p className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                  Kamu sudah punya pengajuan atau peminjaman aktif untuk buku ini.{" "}
                  <Link href="/dashboard/mahasiswa" className="font-semibold underline">Lihat dashboard</Link>
                </p>
              ) : status.telat ? (
                <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  Pengajuan pinjam diblokir karena kamu masih memegang buku yang sudah lewat jatuh tempo.
                  Kembalikan dulu ke meja sirkulasi.
                </p>
              ) : status.reservasi?.status === "Siap Diambil" ? (
                <div className="space-y-3">
                  <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    Giliranmu! Satu eksemplar sudah dicadangkan untukmu. Ajukan peminjaman sebelum{" "}
                    <strong>{formatTanggal(status.reservasi.batas_ambil)}</strong>, kalau tidak giliranmu pindah ke antrean berikutnya.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <AksiForm action={ajukanPinjam} id={b.id} label="Ajukan Pinjam" variant="dark" large />
                    <AksiForm action={batalkanReservasi} id={status.reservasi.id} label="Batalkan Reservasi" variant="neutral" large confirmText="Batalkan reservasi ini?" />
                  </div>
                </div>
              ) : status.reservasi?.status === "Menunggu" ? (
                <div className="space-y-3">
                  <p className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                    Kamu ada di antrean ke-<strong>{status.reservasi.urutan}</strong>. Kamu akan diberi tahu lewat notifikasi saat bukunya siap.
                  </p>
                  <AksiForm action={batalkanReservasi} id={status.reservasi.id} label="Batalkan Reservasi" variant="neutral" large confirmText="Keluar dari antrean?" />
                </div>
              ) : stokBebas <= 0 ? (
                <div className="space-y-3">
                  <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Stok sedang habis. Ikut antrean reservasi, nanti kamu diberi tahu saat bukunya kembali.
                  </p>
                  <AksiForm action={buatReservasi} id={b.id} label="Reservasi Buku" variant="primary" large />
                </div>
              ) : (
                <AksiForm action={ajukanPinjam} id={b.id} label="Ajukan Pinjam" variant="dark" large />
              )}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">Ulasan Pembaca</h2>
          <div className="mt-4 space-y-3">
            {reviews.length === 0 ? (
              <EmptyState title="Belum ada ulasan" description="Ulasan muncul setelah mahasiswa menyelesaikan peminjaman buku ini." />
            ) : (
              reviews.map((r) => (
                <article key={r.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{r.nama_lengkap}</p>
                    <p className="text-sm font-semibold text-amber-600" aria-label={`Rating ${r.rating} dari 5`}>
                      {"★".repeat(r.rating)}
                      <span className="text-slate-300">{"★".repeat(5 - r.rating)}</span>
                    </p>
                  </div>
                  {r.komentar ? <p className="mt-2 text-sm leading-6 text-slate-600">{r.komentar}</p> : null}
                  <p className="mt-3 text-xs text-slate-500">{formatTanggal(r.tanggal)}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </DetailShell>
  );
}
