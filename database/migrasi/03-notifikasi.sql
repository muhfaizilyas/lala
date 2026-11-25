-- =====================================================================
-- migrasi/03-notifikasi.sql
-- Untuk database yang SUDAH berjalan dengan schema.sql versi lama.
-- (Database baru cukup menjalankan schema.sql terbaru + seed.sql.)
--
-- Membuat tabel notifications. Data lama tidak disentuh. Aman dijalankan ulang.
-- =====================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id             SERIAL PRIMARY KEY,
    user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    loan_id        INTEGER REFERENCES loans(id) ON DELETE SET NULL,
    tipe           VARCHAR(30)  NOT NULL
                   CHECK (tipe IN ('pinjam_disetujui', 'pinjam_ditolak',
                                   'buku_kembali', 'denda')),
    judul          VARCHAR(100) NOT NULL,
    pesan          VARCHAR(1000) NOT NULL,
    sudah_dibaca   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
    ON notifications(user_id, sudah_dibaca, created_at DESC);
