// Logika antrean reservasi. Bukan Server Action: dipanggil dari action lain dan halaman.
//
// Aturan inti:
//  - Mahasiswa boleh reservasi hanya kalau buku tidak bisa dipinjam sekarang
//    (stok bebas <= 0). Stok bebas = stok_tersedia - reservasi 'Siap Diambil'.
//  - Saat sebuah eksemplar kembali (atau reservasi lain batal / kedaluwarsa),
//    antrean paling awal naik jadi 'Siap Diambil' dan eksemplar itu dicadangkan
//    selama HARI_AMBIL hari. Peminjam lain tidak bisa mengambilnya.
//  - Lewat batas tanpa diproses -> 'Kedaluwarsa', giliran pindah ke berikutnya.
//  - Tidak ada cron: antrean "disapu" setiap kali ada kejadian terkait
//    (pengembalian, batal, buka halaman buku / dashboard, ajukan / setujui pinjam).
import pool from "@/lib/db";
import { buatNotifikasi } from "@/lib/notifikasi";
import { formatTanggal } from "@/lib/format";

export const HARI_AMBIL = 2;

// Potongan SQL: jumlah eksemplar yang sedang dicadangkan untuk buku `b`.
// Dipakai di query yang mengalias tabel books sebagai b.
export const SQL_DICADANGKAN = `(
  SELECT COUNT(*)::int FROM reservations rv
   WHERE rv.book_id = b.id AND rv.status = 'Siap Diambil' AND rv.batas_ambil >= CURRENT_DATE
)`;

// Stok yang benar-benar bisa dipinjam orang lain (tidak pernah negatif).
export const SQL_STOK_BEBAS = `GREATEST(b.stok_tersedia - ${SQL_DICADANGKAN}, 0)`;

export async function jalankanTransaksi(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const hasil = await fn(client);
    await client.query("COMMIT");
    return hasil;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

// Menyapu satu buku di DALAM transaksi milik pemanggil (client = klien transaksi).
// 1) kedaluwarsakan reservasi 'Siap Diambil' yang lewat batas,
// 2) naikkan antrean 'Menunggu' selama masih ada eksemplar bebas.
export async function sapuBuku(client, bookId) {
  // Kunci baris buku supaya dua proses tidak menaikkan antrean yang sama.
  const { rows: buku } = await client.query(
    "SELECT judul, stok_tersedia FROM books WHERE id = $1 FOR UPDATE",
    [bookId]
  );
  if (!buku[0]) return;
  const { judul, stok_tersedia } = buku[0];

  const { rows: kedaluwarsa } = await client.query(
    `UPDATE reservations SET status = 'Kedaluwarsa'
      WHERE book_id = $1 AND status = 'Siap Diambil' AND batas_ambil < CURRENT_DATE
  RETURNING id, user_id`,
    [bookId]
  );
  for (const r of kedaluwarsa) {
    await buatNotifikasi(client, {
      userId: r.user_id,
      loanId: null,
      tipe: "reservasi_kedaluwarsa",
      judul: "Reservasi kedaluwarsa",
      pesan: `Reservasi "${judul}" hangus karena tidak diproses sebelum batas waktu. Kamu bisa reservasi lagi kalau bukunya masih habis.`,
    });
  }

  const { rows: dicadangkan } = await client.query(
    "SELECT COUNT(*)::int AS n FROM reservations WHERE book_id = $1 AND status = 'Siap Diambil'",
    [bookId]
  );
  let bebas = stok_tersedia - dicadangkan[0].n;

  while (bebas > 0) {
    const { rows } = await client.query(
      `UPDATE reservations
          SET status = 'Siap Diambil', siap_pada = NOW(),
              batas_ambil = CURRENT_DATE + $2::int
        WHERE id = (SELECT rv.id
                      FROM reservations rv
                      JOIN users u ON u.id = rv.user_id
                     WHERE rv.book_id = $1 AND rv.status = 'Menunggu'
                       AND u.is_active = TRUE AND u.role = 'mahasiswa'
                     ORDER BY rv.created_at, rv.id
                     LIMIT 1)
    RETURNING user_id, batas_ambil::text AS batas`,
      [bookId, HARI_AMBIL]
    );
    if (!rows[0]) break; // antrean kosong
    await buatNotifikasi(client, {
      userId: rows[0].user_id,
      loanId: null,
      tipe: "reservasi_siap",
      judul: "Buku reservasimu sudah tersedia",
      pesan: `"${judul}" sudah disiapkan untukmu. Ajukan peminjaman sebelum ${formatTanggal(rows[0].batas)}, kalau tidak giliranmu pindah ke antrean berikutnya.`,
    });
    bebas -= 1;
  }
}

// Menyapu satu buku dengan transaksi sendiri. Cepat keluar kalau buku itu tidak
// punya antrean, jadi aman dipanggil di halaman publik. Kegagalan hanya dicatat
// di log supaya halaman tetap tampil.
export async function sapuBukuMandiri(bookId) {
  try {
    const { rows } = await pool.query(
      `SELECT 1 FROM reservations
        WHERE book_id = $1 AND status IN ('Menunggu', 'Siap Diambil') LIMIT 1`,
      [bookId]
    );
    if (rows.length === 0) return;
    await jalankanTransaksi((client) => sapuBuku(client, bookId));
  } catch (err) {
    console.error("Gagal menyapu antrean reservasi:", err);
  }
}

// Menyapu semua buku yang punya antrean aktif.
export async function sapuSemuaAntrean() {
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT book_id FROM reservations WHERE status IN ('Menunggu', 'Siap Diambil')`
    );
    for (const { book_id } of rows) {
      await jalankanTransaksi((client) => sapuBuku(client, book_id));
    }
  } catch (err) {
    console.error("Gagal menyapu antrean reservasi:", err);
  }
}
