-- =====================================================================
-- migrasi/01-batas-panjang.sql
-- Untuk database yang SUDAH berjalan dengan schema.sql versi lama.
-- (Database baru cukup menjalankan schema.sql terbaru + seed.sql.)
--
-- Membatasi panjang komentar ulasan (1000) dan alasan penolakan (500)
-- supaya sama dengan validasi di backend. Teks lama yang lebih panjang
-- dipotong dulu, kalau tidak ALTER TYPE akan gagal.
-- =====================================================================
BEGIN;

UPDATE reviews SET komentar = LEFT(komentar, 1000)
 WHERE LENGTH(komentar) > 1000;

UPDATE loans SET alasan_penolakan = LEFT(alasan_penolakan, 500)
 WHERE LENGTH(alasan_penolakan) > 500;

ALTER TABLE reviews ALTER COLUMN komentar         TYPE VARCHAR(1000);
ALTER TABLE loans   ALTER COLUMN alasan_penolakan TYPE VARCHAR(500);

COMMIT;
