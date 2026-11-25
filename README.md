# Sistem Manajemen Perpustakaan Kampus

Aplikasi web manajemen perpustakaan kampus untuk mengelola buku, kategori, pengumuman, serta alur peminjaman, perpanjangan, dan denda. Dibuat sebagai **Tugas Final Praktikum Pemrograman Web 2026** (tema: Manajemen Perpustakaan).

- Nama: Muh. Faiz Ilyas
- NIM: H071251083
- Program Studi: Sistem Informasi

## Teknologi

| Bagian | Teknologi |
|---|---|
| Framework | Next.js (App Router, JSX) |
| Styling | Tailwind CSS |
| Database | PostgreSQL, raw SQL lewat library `pg` (tanpa ORM) |
| Autentikasi | Password di-hash dengan `bcryptjs`, sesi berupa cookie `httpOnly` bertanda tangan (`jose`) |

## Peran Pengguna

| Peran | Hak akses utama |
|---|---|
| **Guest** | Melihat beranda, katalog, detail buku, dan pengumuman |
| **Mahasiswa** | Mengajukan peminjaman dan perpanjangan, melihat riwayat dan denda, memberi ulasan |
| **Pegawai Perpustakaan** | Mengelola buku, memproses peminjaman, pengembalian, dan perpanjangan |
| **Admin** | Kelola buku dan pengumuman, memantau seluruh transaksi (hanya lihat), ditambah manajemen user dan kategori |

## Fitur dan Progres

- [x] Skema database dan data awal (seed)
- [x] Login, register mahasiswa (validasi email kampus), logout
- [x] Proteksi halaman berdasarkan role (dicek di server)
- [x] Manajemen kategori (admin)
- [x] Manajemen buku (admin & pegawai)
- [x] Manajemen user (admin): daftar + filter role, tambah, edit, hapus dengan proteksi
- [x] Manajemen pengumuman (Draft / Published), daftar dan detail pengumuman publik
- [x] Beranda (5 buku terpopuler, pengumuman terbaru, pencarian cepat)
- [x] Katalog (filter kategori, urut tahun / rating) dan detail buku dengan ulasan
- [x] Alur peminjaman (pengajuan, persetujuan / penolakan, pengembalian)
- [x] Perpanjangan dan perhitungan denda
- [x] Ulasan dan rating buku
- [x] Dashboard ringkasan Mahasiswa, Pegawai, dan Admin (data dari database)
- [x] Ubah password (semua peran) dan reset password oleh admin
- [x] Sesi lama otomatis keluar setelah password diubah / direset
- [x] Ekspor transaksi + rekap denda ke CSV (khusus admin)
- [x] Notifikasi mahasiswa: pinjam disetujui / ditolak, buku dikembalikan, denda muncul
- [x] Reservasi buku: antrean untuk buku yang stoknya habis, jatah otomatis saat buku kembali

## Aturan Bisnis yang Diterapkan

- Email dan NIM pengguna bersifat unik; register hanya untuk mahasiswa berdomain email kampus.
- Role pengguna ditentukan di server, bukan dari input form.
- Kategori dengan nama atau kode yang sama ditolak; kategori yang masih memiliki buku tidak dapat dihapus.
- Stok buku berubah di dalam transaksi SQL (`BEGIN` / `COMMIT`) saat peminjaman disetujui atau buku dikembalikan.
- Mahasiswa dengan denda berstatus *Tertunggak* tidak dapat mengajukan peminjaman baru.
- Mahasiswa yang masih memegang buku **lewat jatuh tempo** (belum dikembalikan) juga tidak dapat mengajukan pinjam atau reservasi baru. Denda baru tercatat saat buku dikembalikan, jadi tanpa aturan ini mahasiswa yang sedang telat masih bisa meminjam buku lain. Aturannya ada di satu tempat: `src/lib/blokir.js`.
- Perpanjangan tidak dapat diajukan untuk buku yang sudah lewat jatuh tempo (harus dikembalikan) atau yang sedang diantre mahasiswa lain.
- Pencarian membuang karakter NUL dan membatasi kata kunci 100 karakter.
- User tidak dapat dihapus jika masih punya transaksi aktif atau denda tertunggak; admin tidak dapat menghapus atau mengubah role/status akunnya sendiri.

## Ubah Password, Ekspor CSV, dan Notifikasi

- **Ubah password**: halaman `/dashboard/ubah-password` (tautan "Ubah Password" di panel kiri dashboard, semua peran). Wajib mengisi password lama, password baru 8-72 karakter (dihitung dalam byte karena batas bcrypt), dan konfirmasi.
- **Reset oleh admin**: form edit user punya kolom opsional "Password baru". Kosong = password tidak berubah.
- **Cabut sesi lama**: kolom `users.password_diubah_pada` diisi saat password diubah / direset. Token sesi yang dibuat sebelum waktu itu ditolak, jadi perangkat lain otomatis keluar. Perangkat yang dipakai untuk mengubah tetap masuk.
- **Ekspor CSV**: `GET /api/transaksi/export` (hanya admin; 401 jika belum login, 403 jika bukan admin). Berisi seluruh transaksi dan rekap denda di bawahnya. File memakai penanda UTF-8 (BOM), dan sel teks yang diawali `=`, `+`, `-`, `@` diberi awalan `'` agar tidak dijalankan sebagai rumus. Jika Excel (setelan regional Indonesia) membuka CSV dalam satu kolom, pakai `?pemisah=titik-koma` (tombol "CSV untuk Excel" di dashboard admin).
- **Notifikasi**: tabel `notifications` terisi otomatis dari `src/actions/peminjaman.js` (dalam transaksi SQL yang sama dengan perubahan statusnya) dan tampil di dashboard mahasiswa. Belum ada pengingat H-1.

## Reservasi Buku

- Buku yang stoknya habis menampilkan tombol **Reservasi Buku** di halaman detail (hanya mahasiswa tanpa denda tertunggak). Satu mahasiswa hanya boleh punya satu reservasi aktif per buku.
- Status: `Menunggu` (antre, urut waktu daftar) → `Siap Diambil` → `Terpenuhi`; atau `Dibatalkan` / `Kedaluwarsa`.
- Saat buku dikembalikan (atau reservasi lain batal / kedaluwarsa, atau stok ditambah), antrean paling awal naik menjadi `Siap Diambil` dan mendapat notifikasi. Satu eksemplar **dicadangkan** untuknya selama 2 hari (`HARI_AMBIL` di `src/lib/reservasi.js`): mahasiswa lain tidak bisa mengajukan atau disetujui pinjamannya untuk eksemplar itu.
- Pemegang jatah mengajukan pinjam seperti biasa. Saat pengajuan dibuat, batas jatahnya diperpanjang 2 hari supaya pegawai punya waktu memproses. Reservasi menjadi `Terpenuhi` ketika pegawai menyetujui pinjamannya.
- Lewat batas tanpa diproses: `Kedaluwarsa`, mahasiswa diberi notifikasi, dan antrean berikutnya naik.
- Eksemplar yang dicadangkan tidak mengurangi `books.stok_tersedia`. Stok yang tampil di katalog dan halaman detail adalah stok bebas (`stok_tersedia` dikurangi yang dicadangkan).
- Tidak ada cron. Kedaluwarsa dan kenaikan antrean diproses saat ada kejadian terkait: pengembalian, pembatalan, membuka halaman buku / dashboard mahasiswa / daftar reservasi staf, serta saat mengajukan atau menyetujui pinjam.
- Admin dan pegawai melihat antrean di menu **Reservasi** (`/dashboard/transaksi/reservasi`, hanya lihat).

## Cara Menjalankan

### 1. Prasyarat

- Node.js 20 atau lebih baru
- PostgreSQL (disarankan versi 14 ke atas) dan pgAdmin

### 2. Clone dan install

```bash
git clone <url-repository-ini>
cd <nama-folder-repository>
npm install
```

### 3. Siapkan database

1. Buat database baru bernama `perpustakaan` (lewat pgAdmin atau `createdb perpustakaan`).
2. Jalankan `database/schema.sql` pada database tersebut, lalu `database/seed.sql`.
   (Database lama yang sudah berisi data? Lewati langkah ini dan jalankan migrasi di bawah.)

   Dengan `psql`:

   ```bash
   psql -U postgres -d perpustakaan -f database/schema.sql
   psql -U postgres -d perpustakaan -f database/seed.sql
   ```

   `schema.sql` dapat dijalankan ulang kapan saja (menghapus dan membuat ulang semua tabel).

   **Database yang sudah berisi data** tidak perlu dibuat ulang: jalankan empat file di `database/migrasi/` sesuai urutan nomornya (aman dijalankan ulang, data tidak berubah):

   ```bash
   psql -U postgres -d perpustakaan -f database/migrasi/01-batas-panjang.sql
   psql -U postgres -d perpustakaan -f database/migrasi/02-password-diubah-pada.sql
   psql -U postgres -d perpustakaan -f database/migrasi/03-notifikasi.sql
   psql -U postgres -d perpustakaan -f database/migrasi/04-reservasi.sql
   ```

   | File | Isi |
   |---|---|
   | `01-batas-panjang.sql` | membatasi komentar ulasan (1000) dan alasan penolakan (500) |
   | `02-password-diubah-pada.sql` | kolom `users.password_diubah_pada` untuk mencabut sesi lama |
   | `03-notifikasi.sql` | tabel `notifications` |
   | `04-reservasi.sql` | tabel `reservations` dan dua tipe notifikasi reservasi |

   Database baru yang memakai `schema.sql` terbaru **tidak** membutuhkan migrasi. Tanpa migrasi pada database lama, login dan proses peminjaman akan error.

### 4. Konfigurasi environment

Salin `.env.example` menjadi `.env.local`, lalu isi:

```env
DATABASE_URL=postgresql://postgres:PASSWORD_KAMU@localhost:5432/perpustakaan
SESSION_SECRET=<tempel hasil perintah di bawah, minimal 32 karakter>
```

Membuat `SESSION_SECRET` acak (aplikasi menolak nilai yang kurang dari 32 karakter):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Jika password PostgreSQL memuat karakter khusus, ubah dengan URL-encoding (`@` menjadi `%40`, `#` menjadi `%23`).

### 5. Jalankan

```bash
npm run dev
```

Buka <http://localhost:3000>. Restart server setiap kali `.env.local` diubah.

## Akun Demo (dari seed)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@kampus.ac.id` | `admin123` |
| Pegawai | `pegawai1@kampus.ac.id` | `pegawai123` |
| Mahasiswa | `budi@student.kampus.ac.id` | `mahasiswa123` |

Dua akun lain sengaja dibuat untuk menguji pemblokiran peminjaman (password sama, `mahasiswa123`):

- `andi@student.kampus.ac.id` memiliki denda *Tertunggak*.
- `siti@student.kampus.ac.id` sedang memegang buku yang lewat jatuh tempo.

## Struktur Folder

```
database/          schema.sql, seed.sql (di luar folder app)
  migrasi/         01-04: hanya untuk database lama yang sudah berisi data
src/
  actions/         Server Actions (auth, kategori, buku, peminjaman, notifikasi, pengumuman, reservasi, user)
  app/             halaman dan route (App Router)
    login/ register/
    katalog/ buku/[id]/ pengumuman/ pengumuman/[id]/   halaman publik
    dashboard/     admin/ pegawai/ mahasiswa/ buku/ transaksi/ pengumuman/ ubah-password/
    api/           buku (pencarian JSON), transaksi/export (CSV, admin)
  components/      komponen UI (form, tombol, kerangka halaman, ...)
  lib/             db, session, auth, validation, parseId, pencarian, blokir, csv, notifikasi, reservasi, format, katalog, navigation
```

## Catatan Keamanan

- Semua query memakai parameter (`$1`, `$2`) untuk mencegah SQL injection.
- Password tidak pernah disimpan sebagai teks asli (hash bcrypt).
- Ekspor CSV hanya untuk admin dan dicek di server; sel CSV yang berawalan rumus diamankan.
- Setiap Server Action memeriksa role pengguna sendiri, tidak hanya mengandalkan guard halaman.
- Password diperiksa dalam byte (batas bcrypt 72 byte), jadi emoji tidak terpotong diam-diam.
- Header keamanan dasar dipasang di `next.config.mjs` (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`); header `X-Powered-By` dimatikan.
- Belum ada pembatasan percobaan login dan pengingat jatuh tempo H-1.
- File `.env.local` tidak ikut di-commit.