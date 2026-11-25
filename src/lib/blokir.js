// Aturan blokir untuk mahasiswa. Dipakai bersama oleh pengajuan pinjam,
// reservasi, halaman detail buku, dan dashboard supaya aturannya satu.
//
// Mahasiswa diblokir jika:
//   1. masih punya denda berstatus Tertunggak (aturan dari soal), atau
//   2. masih memegang buku yang sudah lewat jatuh tempo dan belum dikembalikan.
//      Denda baru tercatat saat buku dikembalikan, jadi tanpa aturan ini
//      mahasiswa yang sedang telat masih bisa meminjam buku lain.

// `db` boleh pool (query biasa) atau client transaksi.
// Mengembalikan { denda, telat, alasan } dengan alasan: null | "denda" | "telat".
export async function cekBlokir(db, userId) {
  const { rows } = await db.query(
    `SELECT COALESCE(SUM(denda_nominal) FILTER (WHERE status_denda = 'Tertunggak'), 0)::float AS denda,
            COUNT(*) FILTER (WHERE status_pinjam = 'Sedang Dipinjam'
                               AND tanggal_jatuh_tempo < CURRENT_DATE)::int AS telat
       FROM loans WHERE user_id = $1`,
    [userId]
  );
  const { denda, telat } = rows[0];
  const alasan = denda > 0 ? "denda" : telat > 0 ? "telat" : null;
  return { denda, telat, alasan };
}

// Kalimat penolakan untuk aksi tertentu ("meminjam" atau "reservasi").
export function pesanBlokir(blokir, aksi = "meminjam") {
  if (blokir.alasan === "denda") {
    return `Kamu masih punya denda tertunggak. Lunasi dulu sebelum ${aksi === "reservasi" ? "reservasi" : "meminjam lagi"}.`;
  }
  if (blokir.alasan === "telat") {
    return `Kamu masih memegang ${blokir.telat} buku yang lewat jatuh tempo. Kembalikan ke meja sirkulasi dulu sebelum ${aksi === "reservasi" ? "reservasi" : "meminjam lagi"}.`;
  }
  return "";
}
