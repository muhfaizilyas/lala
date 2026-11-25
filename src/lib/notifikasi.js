// Helper notifikasi. Bukan Server Action, hanya dipanggil dari dalam action lain.

export const TIPE_NOTIFIKASI = {
  pinjam_disetujui: { label: "Disetujui", tone: "success" },
  pinjam_ditolak: { label: "Ditolak", tone: "danger" },
  buku_kembali: { label: "Dikembalikan", tone: "info" },
  denda: { label: "Denda", tone: "warning" },
  reservasi_siap: { label: "Reservasi", tone: "success" },
  reservasi_kedaluwarsa: { label: "Kedaluwarsa", tone: "warning" },
};

// `db` boleh pool (query biasa) atau client transaksi. Kalau dipanggil di dalam
// transaksi, notifikasi ikut batal bila transaksinya di-ROLLBACK.
export async function buatNotifikasi(db, { userId, loanId, tipe, judul, pesan }) {
  await db.query(
    `INSERT INTO notifications (user_id, loan_id, tipe, judul, pesan)
     VALUES ($1, $2, $3, $4, $5)`,
    // Potong sesuai batas kolom supaya judul buku panjang tidak membuat INSERT gagal.
    [userId, loanId, tipe, judul.slice(0, 100), pesan.slice(0, 1000)]
  );
}
