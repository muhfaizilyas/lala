-- =====================================================================
-- migrasi/02-password-diubah-pada.sql
-- Untuk database yang SUDAH berjalan dengan schema.sql versi lama.
-- (Database baru cukup menjalankan schema.sql terbaru + seed.sql.)
--
-- Menambah kolom users.password_diubah_pada. Setelah password diubah atau
-- direset admin, sesi (cookie) yang dibuat sebelum waktu itu otomatis ditolak,
-- jadi perangkat lain ikut keluar. Aman dijalankan ulang.
-- =====================================================================
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password_diubah_pada TIMESTAMPTZ;
