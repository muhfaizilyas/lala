-- =====================================================================
-- migrasi/04-reservasi.sql
-- Untuk database yang SUDAH berjalan. Jalankan SETELAH 03-notifikasi.sql.
-- (Database baru cukup menjalankan schema.sql terbaru + seed.sql.)
--
-- 1. Membuat tabel reservations (antrean buku yang stoknya habis).
-- 2. Menambah dua jenis notifikasi baru (reservasi_siap, reservasi_kedaluwarsa).
-- Data lama tidak disentuh. Aman dijalankan ulang.
-- =====================================================================
BEGIN;

CREATE TABLE IF NOT EXISTS reservations (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id      INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    status       VARCHAR(20) NOT NULL DEFAULT 'Menunggu'
                 CHECK (status IN ('Menunggu', 'Siap Diambil', 'Terpenuhi',
                                   'Dibatalkan', 'Kedaluwarsa')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    siap_pada    TIMESTAMPTZ,
    batas_ambil  DATE,
    loan_id      INTEGER REFERENCES loans(id) ON DELETE SET NULL,
    CHECK (status <> 'Siap Diambil' OR batas_ambil IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_reservations_antrean ON reservations(book_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_reservations_user    ON reservations(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_reservations_aktif
    ON reservations(user_id, book_id)
    WHERE status IN ('Menunggu', 'Siap Diambil');

-- Perluas daftar tipe notifikasi.
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_tipe_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_tipe_check
    CHECK (tipe IN ('pinjam_disetujui', 'pinjam_ditolak', 'buku_kembali', 'denda',
                    'reservasi_siap', 'reservasi_kedaluwarsa'));

COMMIT;
