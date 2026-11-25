-- =====================================================================
-- seed.sql : data awal Sistem Manajemen Perpustakaan
-- Jalankan SETELAH schema.sql pada database  perpustakaan
--
-- AKUN DEMO (password asli ada di kolom komentar, di database
-- tersimpan dalam bentuk hash bcrypt):
--   admin     : admin@kampus.ac.id            / admin123
--   pegawai   : pegawai1@kampus.ac.id         / pegawai123
--               pegawai2@kampus.ac.id         / pegawai123
--   mahasiswa : budi@student.kampus.ac.id     / mahasiswa123
--               siti@student.kampus.ac.id     / mahasiswa123
--               andi@student.kampus.ac.id     / mahasiswa123
--
-- Data buku adalah data contoh; ISBN bersifat fiktif.
-- Urutan insert sengaja dibuat tetap agar id-nya bisa dirujuk
-- (admin=1, pegawai=2-3, mahasiswa=4-6, buku=1-8, transaksi=1-9).
-- =====================================================================

-- ---------------------------------------------------------------------
-- USERS
-- ---------------------------------------------------------------------
INSERT INTO users (nama_lengkap, email, password, role, nomor_identitas) VALUES
('Administrator Perpustakaan', 'admin@kampus.ac.id',
 '$2b$10$pHo73h6l6TYgI3mCLgJ9AO5kJh4b5aBAMPvh.VUIP0MLb.2PpiGm.', 'admin', 'ADM001'),
('Rahma Pegawai', 'pegawai1@kampus.ac.id',
 '$2b$10$FybsIwEaMDpSD8KIxFUtw.hPtGJUCBZ3AvZQbG62r6OZlkna99Yze', 'pegawai', 'PGW001'),
('Dimas Pegawai', 'pegawai2@kampus.ac.id',
 '$2b$10$FybsIwEaMDpSD8KIxFUtw.hPtGJUCBZ3AvZQbG62r6OZlkna99Yze', 'pegawai', 'PGW002'),
('Budi Santoso', 'budi@student.kampus.ac.id',
 '$2b$10$9jFSee8cGrrz.5clibFJku9gsc771R04rWdO.WfuAUJZ9jFOcZTBa', 'mahasiswa', '2023001'),
('Siti Aisyah', 'siti@student.kampus.ac.id',
 '$2b$10$9jFSee8cGrrz.5clibFJku9gsc771R04rWdO.WfuAUJZ9jFOcZTBa', 'mahasiswa', '2023002'),
('Andi Pratama', 'andi@student.kampus.ac.id',
 '$2b$10$9jFSee8cGrrz.5clibFJku9gsc771R04rWdO.WfuAUJZ9jFOcZTBa', 'mahasiswa', '2023003');

-- ---------------------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------------------
INSERT INTO categories (nama, kode, deskripsi) VALUES
('Teknologi Informasi', 'TI', 'Pemrograman, basis data, algoritma, dan jaringan'),
('Hukum', 'HK', 'Ilmu hukum dan perundang-undangan'),
('Kedokteran', 'KD', 'Ilmu kedokteran dan kesehatan'),
('Sastra & Bahasa', 'SB', 'Novel, kumpulan cerita, dan kajian bahasa'),
('Ekonomi & Bisnis', 'EB', 'Ekonomi, manajemen, dan akuntansi');

-- ---------------------------------------------------------------------
-- BOOKS
-- stok_tersedia = stok_total - jumlah transaksi berstatus 'Sedang Dipinjam'
-- ---------------------------------------------------------------------
INSERT INTO books
(judul, isbn, pengarang, penerbit, tahun_terbit, category_id,
 stok_total, stok_tersedia, durasi_maks_pinjam, denda_per_hari, cover_url) VALUES
('Clean Code', '978-602-0000-01-1', 'Robert C. Martin', 'Prentice Hall', 2008, 1, 5, 5, 7, 1000, 'https://placehold.co/300x440/1b3358/f4ecd8?text=Clean+Code'),
('Introduction to Algorithms', '978-602-0000-02-8', 'Thomas H. Cormen dkk.', 'MIT Press', 2009, 1, 3, 3, 14, 1000, 'https://placehold.co/300x440/1b3358/f4ecd8?text=Introduction+to+Algorithms'),
('Database System Concepts', '978-602-0000-03-5', 'Abraham Silberschatz dkk.', 'McGraw-Hill', 2019, 1, 4, 3, 7, 1000, 'https://placehold.co/300x440/1b3358/f4ecd8?text=Database+System+Concepts'),
('Pengantar Ilmu Hukum', '978-602-0000-04-2', 'Peter Mahmud Marzuki', 'Kencana', 2008, 2, 3, 2, 7, 1500, 'https://placehold.co/300x440/1b3358/f4ecd8?text=Pengantar+Ilmu+Hukum'),
('Textbook of Medical Physiology', '978-602-0000-05-9', 'John E. Hall', 'Elsevier', 2016, 3, 2, 2, 7, 2000, 'https://placehold.co/300x440/1b3358/f4ecd8?text=Textbook+of+Medical+Physiology'),
('Principles of Economics', '978-602-0000-06-6', 'N. Gregory Mankiw', 'Cengage Learning', 2014, 5, 4, 4, 14, 1000, 'https://placehold.co/300x440/1b3358/f4ecd8?text=Principles+of+Economics'),
('Laskar Pelangi', '978-602-0000-07-3', 'Andrea Hirata', 'Bentang Pustaka', 2005, 4, 6, 6, 7, 500, 'https://placehold.co/300x440/1b3358/f4ecd8?text=Laskar+Pelangi'),
('Bumi Manusia', '978-602-0000-08-0', 'Pramoedya Ananta Toer', 'Hasta Mitra', 1980, 4, 2, 0, 7, 500, 'https://placehold.co/300x440/1b3358/f4ecd8?text=Bumi+Manusia');

-- ---------------------------------------------------------------------
-- ANNOUNCEMENTS (dibuat oleh pegawai id=2)
-- ---------------------------------------------------------------------
INSERT INTO announcements (judul, konten, kategori, tanggal_rilis, status, created_by) VALUES
('Jadwal Layanan Selama Libur Akhir Tahun',
 'Perpustakaan tutup pada tanggal 24 Desember 2026 sampai 1 Januari 2027. Layanan peminjaman dibuka kembali pada 2 Januari 2027. Mohon kembalikan buku sebelum tanggal jatuh tempo.',
 'Operasional', '2026-11-15', 'Published', 2),
('Koleksi Baru: Buku Teknologi Informasi',
 'Perpustakaan menambah koleksi buku bidang Teknologi Informasi, termasuk basis data dan algoritma. Silakan cek katalog untuk melihat ketersediaannya.',
 'Layanan', '2026-11-10', 'Published', 2),
('Workshop Literasi Informasi',
 'Perpustakaan mengadakan workshop pencarian referensi ilmiah untuk mahasiswa. Pendaftaran dibuka di meja sirkulasi.',
 'Acara', '2026-11-18', 'Published', 3),
('Pengumuman Draft: Pembaruan Aturan Denda',
 'Draft rencana pembaruan aturan denda keterlambatan. Belum untuk dipublikasikan.',
 'Layanan', '2026-11-20', 'Draft', 2);

-- ---------------------------------------------------------------------
-- LOANS (tanggal acuan: 20 November 2026)
--  id 1 : Selesai tepat waktu                       (Budi, Clean Code)
--  id 2 : Selesai terlambat 6 hari, denda Tertunggak (Andi, Intro to Algorithms)
--         -> Andi diblokir mengajukan pinjam baru
--  id 3 : Sedang Dipinjam, sudah lewat jatuh tempo   (Siti, Database System Concepts)
--  id 4 : Sedang Dipinjam + Perpanjangan Diajukan    (Budi, Pengantar Ilmu Hukum)
--  id 5 : Menunggu Konfirmasi                        (Siti, Medical Physiology)
--  id 6 : Selesai                                    (Budi, Laskar Pelangi)
--  id 7 : Sedang Dipinjam                            (Siti, Bumi Manusia)
--  id 8 : Sedang Dipinjam                            (Budi, Bumi Manusia) -> stok habis
--  id 9 : Ditolak dengan alasan                      (Andi, Principles of Economics)
-- ---------------------------------------------------------------------
INSERT INTO loans
(user_id, book_id, status_pinjam, status_perpanjangan, tanggal_pengajuan,
 tanggal_pinjam, tanggal_jatuh_tempo, tanggal_kembali, alasan_penolakan,
 denda_nominal, status_denda, tanggal_denda_lunas, processed_by) VALUES
(4, 1, 'Selesai', NULL, '2026-10-01 09:00',
 '2026-10-01', '2026-10-08', '2026-10-07', NULL, 0, 'Tidak Ada', NULL, 2),
(6, 2, 'Selesai', NULL, '2026-10-10 10:00',
 '2026-10-10', '2026-10-24', '2026-10-30', NULL, 6000, 'Tertunggak', NULL, 2),
(5, 3, 'Sedang Dipinjam', NULL, '2026-11-01 08:30',
 '2026-11-01', '2026-11-08', NULL, NULL, 0, 'Tidak Ada', NULL, 3),
(4, 4, 'Sedang Dipinjam', 'Perpanjangan Diajukan', '2026-11-18 09:15',
 '2026-11-18', '2026-11-25', NULL, NULL, 0, 'Tidak Ada', NULL, 2),
(5, 5, 'Menunggu Konfirmasi', NULL, '2026-11-20 08:00',
 NULL, NULL, NULL, NULL, 0, 'Tidak Ada', NULL, NULL),
(4, 7, 'Selesai', NULL, '2026-09-15 13:00',
 '2026-09-15', '2026-09-22', '2026-09-20', NULL, 0, 'Tidak Ada', NULL, 3),
(5, 8, 'Sedang Dipinjam', NULL, '2026-11-17 10:00',
 '2026-11-17', '2026-11-24', NULL, NULL, 0, 'Tidak Ada', NULL, 2),
(4, 8, 'Sedang Dipinjam', NULL, '2026-11-19 11:00',
 '2026-11-19', '2026-11-26', NULL, NULL, 0, 'Tidak Ada', NULL, 3),
(6, 6, 'Ditolak', NULL, '2026-11-12 14:00',
 NULL, NULL, NULL, 'Buku sedang dicadangkan untuk keperluan perkuliahan', 0, 'Tidak Ada', NULL, 2);

-- ---------------------------------------------------------------------
-- REVIEWS (hanya untuk transaksi berstatus Selesai: id 1, 2, 6)
-- ---------------------------------------------------------------------
INSERT INTO reviews (loan_id, rating, komentar) VALUES
(1, 5, 'Penjelasannya jelas dan contohnya mudah dipahami.'),
(2, 4, 'Isinya lengkap, tetapi cukup berat untuk pemula.'),
(6, 4, 'Ceritanya inspiratif dan enak dibaca.');