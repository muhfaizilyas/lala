-- =====================================================================
-- schema.sql : Sistem Manajemen Perpustakaan
-- Praktikum Pemrograman Web 2026 (PostgreSQL)
--
-- Cara pakai (pgAdmin):
--   1. Buat database kosong bernama  perpustakaan
--   2. Buka Query Tool pada database tersebut
--   3. Jalankan schema.sql, lalu jalankan seed.sql
--
-- File ini aman dijalankan ulang: semua tabel dihapus lalu dibuat lagi.
-- =====================================================================

DROP TABLE IF EXISTS reservations  CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reviews       CASCADE;
DROP TABLE IF EXISTS loans         CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS books         CASCADE;
DROP TABLE IF EXISTS categories    CASCADE;
DROP TABLE IF EXISTS users         CASCADE;

-- ---------------------------------------------------------------------
-- 1. USERS (Admin, Pegawai, Mahasiswa)
--    password berisi HASH bcrypt, bukan teks asli.
--    Guest tidak punya akun, jadi tidak ada di tabel ini.
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id               SERIAL PRIMARY KEY,
    nama_lengkap     VARCHAR(100) NOT NULL,
    email            VARCHAR(100) NOT NULL UNIQUE,
    password         VARCHAR(255) NOT NULL,
    role             VARCHAR(20)  NOT NULL
                     CHECK (role IN ('admin', 'pegawai', 'mahasiswa')),
    nomor_identitas  VARCHAR(30)  NOT NULL UNIQUE,   -- NIM / NIP
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    -- Waktu terakhir password diubah / direset. Sesi (cookie) yang dibuat
    -- SEBELUM waktu ini dianggap tidak berlaku lagi. NULL = belum pernah diubah.
    password_diubah_pada  TIMESTAMPTZ
);

-- ---------------------------------------------------------------------
-- 2. CATEGORIES (dikelola Admin)
--    Nama dan kode wajib unik.
-- ---------------------------------------------------------------------
CREATE TABLE categories (
    id         SERIAL PRIMARY KEY,
    nama       VARCHAR(100) NOT NULL UNIQUE,
    kode       VARCHAR(20)  NOT NULL UNIQUE,
    deskripsi  TEXT
);

-- ---------------------------------------------------------------------
-- 3. BOOKS (dikelola Pegawai & Admin)
--    stok_total     : jumlah eksemplar yang dimiliki perpustakaan
--    stok_tersedia  : yang saat ini bisa dipinjam
--    Approve peminjaman -> stok_tersedia - 1
--    Pengembalian       -> stok_tersedia + 1
--    (kedua langkah harus dijalankan dalam transaksi SQL)
--
--    Kategori yang masih dipakai buku tidak bisa dihapus (RESTRICT).
-- ---------------------------------------------------------------------
CREATE TABLE books (
    id                  SERIAL PRIMARY KEY,
    judul               VARCHAR(200) NOT NULL,
    isbn                VARCHAR(20)  NOT NULL UNIQUE,
    pengarang           VARCHAR(150) NOT NULL,
    penerbit            VARCHAR(150) NOT NULL,
    tahun_terbit        INTEGER      NOT NULL
                        CHECK (tahun_terbit BETWEEN 1000 AND 2100),
    category_id         INTEGER      NOT NULL
                        REFERENCES categories(id) ON DELETE RESTRICT,
    stok_total          INTEGER      NOT NULL CHECK (stok_total >= 0),
    stok_tersedia       INTEGER      NOT NULL CHECK (stok_tersedia >= 0),
    durasi_maks_pinjam  INTEGER      NOT NULL CHECK (durasi_maks_pinjam > 0),  -- hari
    denda_per_hari      NUMERIC(10,2) NOT NULL CHECK (denda_per_hari >= 0),
    cover_url           TEXT,
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    CHECK (stok_tersedia <= stok_total)
);

CREATE INDEX idx_books_category ON books(category_id);

-- ---------------------------------------------------------------------
-- 4. ANNOUNCEMENTS (dikelola Pegawai & Admin)
--    Hanya yang berstatus 'Published' tampil di halaman publik.
-- ---------------------------------------------------------------------
CREATE TABLE announcements (
    id             SERIAL PRIMARY KEY,
    judul          VARCHAR(200) NOT NULL,
    konten         TEXT         NOT NULL,
    kategori       VARCHAR(20)  NOT NULL
                   CHECK (kategori IN ('Operasional', 'Layanan', 'Acara')),
    tanggal_rilis  DATE         NOT NULL DEFAULT CURRENT_DATE,
    status         VARCHAR(20)  NOT NULL DEFAULT 'Draft'
                   CHECK (status IN ('Draft', 'Published')),
    created_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_announcements_publik ON announcements(status, tanggal_rilis DESC);

-- ---------------------------------------------------------------------
-- 5. LOANS (inti sistem: peminjaman, perpanjangan, denda)
--
--  status_pinjam:
--    Menunggu Konfirmasi -> (Pegawai Approve) -> Sedang Dipinjam -> Selesai
--                        -> (Pegawai Reject)  -> Ditolak (wajib ada alasan)
--
--  status_perpanjangan (hanya untuk yang Sedang Dipinjam):
--    NULL -> Perpanjangan Diajukan -> Perpanjangan Disetujui / Ditolak
--    Jika disetujui, tanggal_jatuh_tempo ditambah otomatis.
--
--  Denda:
--    - Keterlambatan dihitung di backend saat runtime (tanggal hari ini
--      atau tanggal_kembali dibandingkan tanggal_jatuh_tempo, dikali
--      denda_per_hari milik buku).
--    - Saat buku dikembalikan terlambat, hasilnya disimpan ke
--      denda_nominal dengan status_denda = 'Tertunggak'.
--    - Pegawai mengubah status_denda menjadi 'Lunas'.
--    - Mahasiswa dengan status_denda 'Tertunggak' tidak boleh
--      mengajukan peminjaman baru.
--
--  Menghapus user atau buku ikut menghapus transaksinya (CASCADE).
--  Karena itu backend memeriksa dulu sebelum DELETE dijalankan:
--    - buku : ditolak jika ada transaksi aktif ATAU denda Tertunggak
--    - user : ditolak jika ada transaksi aktif ATAU denda Tertunggak
-- ---------------------------------------------------------------------
CREATE TABLE loans (
    id                    SERIAL PRIMARY KEY,
    user_id               INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id               INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,

    status_pinjam         VARCHAR(30) NOT NULL DEFAULT 'Menunggu Konfirmasi'
                          CHECK (status_pinjam IN
                                 ('Menunggu Konfirmasi', 'Sedang Dipinjam',
                                  'Ditolak', 'Selesai')),
    status_perpanjangan   VARCHAR(30)
                          CHECK (status_perpanjangan IN
                                 ('Perpanjangan Diajukan', 'Perpanjangan Disetujui',
                                  'Perpanjangan Ditolak')),

    tanggal_pengajuan     TIMESTAMP NOT NULL DEFAULT NOW(),
    tanggal_pinjam        DATE,
    tanggal_jatuh_tempo   DATE,
    tanggal_kembali       DATE,
    alasan_penolakan      VARCHAR(500),   -- batas sama dengan validasi di backend

    denda_nominal         NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (denda_nominal >= 0),
    status_denda          VARCHAR(20) NOT NULL DEFAULT 'Tidak Ada'
                          CHECK (status_denda IN ('Tidak Ada', 'Tertunggak', 'Lunas')),
    tanggal_denda_lunas   DATE,

    processed_by          INTEGER REFERENCES users(id) ON DELETE SET NULL,  -- pegawai

    CHECK (status_pinjam NOT IN ('Sedang Dipinjam', 'Selesai')
           OR (tanggal_pinjam IS NOT NULL AND tanggal_jatuh_tempo IS NOT NULL)),
    CHECK (status_pinjam <> 'Selesai' OR tanggal_kembali IS NOT NULL),
    CHECK (status_pinjam <> 'Ditolak' OR alasan_penolakan IS NOT NULL)
);

CREATE INDEX idx_loans_user   ON loans(user_id);
CREATE INDEX idx_loans_book   ON loans(book_id);
CREATE INDEX idx_loans_status ON loans(status_pinjam);

-- Satu mahasiswa tidak boleh punya dua pengajuan/peminjaman aktif
-- untuk buku yang sama.
CREATE UNIQUE INDEX uq_loans_aktif_per_buku
    ON loans(user_id, book_id)
    WHERE status_pinjam IN ('Menunggu Konfirmasi', 'Sedang Dipinjam');

-- ---------------------------------------------------------------------
-- 6. REVIEWS (rating 1-5 + komentar)
--    Satu ulasan per transaksi (loan_id UNIQUE).
--    Backend memastikan loans.status_pinjam = 'Selesai' sebelum INSERT.
--    Untuk mengetahui buku dan penulis ulasan, JOIN ke tabel loans.
-- ---------------------------------------------------------------------
CREATE TABLE reviews (
    id          SERIAL PRIMARY KEY,
    loan_id     INTEGER NOT NULL UNIQUE REFERENCES loans(id) ON DELETE CASCADE,
    rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    komentar    VARCHAR(1000),   -- batas sama dengan validasi di backend
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 7. NOTIFICATIONS (pemberitahuan untuk mahasiswa)
--    Diisi otomatis oleh backend saat: pengajuan pinjam disetujui / ditolak,
--    buku dikembalikan, dan denda muncul. Ditampilkan di dashboard mahasiswa.
--    loan_id dibiarkan NULL jika transaksinya sudah terhapus.
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
    id             SERIAL PRIMARY KEY,
    user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    loan_id        INTEGER REFERENCES loans(id) ON DELETE SET NULL,
    tipe           VARCHAR(30)  NOT NULL
                   CHECK (tipe IN ('pinjam_disetujui', 'pinjam_ditolak',
                                   'buku_kembali', 'denda',
                                   'reservasi_siap', 'reservasi_kedaluwarsa')),
    judul          VARCHAR(100) NOT NULL,
    pesan          VARCHAR(1000) NOT NULL,
    sudah_dibaca   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user
    ON notifications(user_id, sudah_dibaca, created_at DESC);

-- ---------------------------------------------------------------------
-- 8. RESERVATIONS (antrean buku yang stoknya habis)
--
--  status:
--    Menunggu     -> ikut antrean (urut created_at, id)
--    Siap Diambil -> satu eksemplar dicadangkan untuknya sampai batas_ambil
--                    (dipicu saat buku dikembalikan / reservasi lain batal / kedaluwarsa)
--    Terpenuhi    -> pengajuan pinjamnya disetujui pegawai (loan_id terisi)
--    Dibatalkan   -> dibatalkan mahasiswa
--    Kedaluwarsa  -> lewat batas_ambil tanpa diproses, giliran pindah ke antrean berikutnya
--
--  Eksemplar yang dicadangkan TIDAK mengurangi books.stok_tersedia; backend
--  menghitung stok bebas = stok_tersedia - jumlah reservasi 'Siap Diambil'.
--  Satu mahasiswa hanya boleh punya satu reservasi aktif per buku.
-- ---------------------------------------------------------------------
CREATE TABLE reservations (
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

CREATE INDEX idx_reservations_antrean ON reservations(book_id, status, created_at);
CREATE INDEX idx_reservations_user    ON reservations(user_id);

CREATE UNIQUE INDEX uq_reservations_aktif
    ON reservations(user_id, book_id)
    WHERE status IN ('Menunggu', 'Siap Diambil');
