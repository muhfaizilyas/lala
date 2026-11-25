import { parseId } from "@/lib/parseId";

// Ubah sesuai domain kampus di spesifikasi tugas kalau berbeda.
const DOMAIN_EMAIL_MAHASISWA = "@student.kampus.ac.id";

// Batas panjang input. Harus sama dengan tipe kolom di database/schema.sql,
// kalau tidak PostgreSQL menolak dengan error "value too long" (halaman crash).
const BATAS = {
  nama: 100,
  email: 100,
  komentar: 1000,
  alasan: 500,
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email) errors.email = "Email wajib diisi.";
  else if (!EMAIL_REGEX.test(email)) errors.email = "Format email tidak valid.";
  if (!password) errors.password = "Password wajib diisi.";
  return errors;
}

export function validateRegister({
  nama_lengkap,
  email,
  nomor_identitas,
  password,
  konfirmasi,
}) {
  const errors = {};

  if (!nama_lengkap) errors.nama_lengkap = "Nama lengkap wajib diisi.";
  else if (nama_lengkap.length < 3)
    errors.nama_lengkap = "Nama minimal 3 karakter.";
  else if (nama_lengkap.length > BATAS.nama)
    errors.nama_lengkap = `Nama maksimal ${BATAS.nama} karakter.`;

  if (!email) errors.email = "Email wajib diisi.";
  else if (email.length > BATAS.email)
    errors.email = `Email maksimal ${BATAS.email} karakter.`;
  else if (!EMAIL_REGEX.test(email)) errors.email = "Format email tidak valid.";
  else if (!email.endsWith(DOMAIN_EMAIL_MAHASISWA))
    errors.email = `Gunakan email kampus (${DOMAIN_EMAIL_MAHASISWA}).`;

  if (!nomor_identitas) errors.nomor_identitas = "NIM wajib diisi.";
  else if (!/^\d{5,20}$/.test(nomor_identitas))
    errors.nomor_identitas = "NIM harus berupa angka (5-20 digit).";

  if (!password) errors.password = "Password wajib diisi.";
  else if (pesanPasswordBaru(password))
    errors.password = pesanPasswordBaru(password);

  if (!konfirmasi) errors.konfirmasi = "Konfirmasi password wajib diisi.";
  else if (password !== konfirmasi)
    errors.konfirmasi = "Konfirmasi password tidak sama.";

  return errors;
}

export function validateKategori({ nama, kode, deskripsi }) {
  const errors = {};

  if (!nama) errors.nama = "Nama kategori wajib diisi.";
  else if (nama.length < 3) errors.nama = "Nama minimal 3 karakter.";
  else if (nama.length > 100) errors.nama = "Nama maksimal 100 karakter.";

  if (!kode) errors.kode = "Kode kategori wajib diisi.";
  else if (!/^[A-Z0-9]{2,20}$/.test(kode))
    errors.kode = "Kode 2-20 karakter, hanya huruf dan angka (contoh: TI).";

  if (deskripsi && deskripsi.length > 500)
    errors.deskripsi = "Deskripsi maksimal 500 karakter.";

  return errors;
}

// Semua nilai masuk sebagai string (dari form). Konversi angka dilakukan di action.
export function validateBuku(v) {
  const errors = {};
  const tahunMaks = new Date().getFullYear();

  if (!v.judul) errors.judul = "Judul wajib diisi.";
  else if (v.judul.length > 200) errors.judul = "Judul maksimal 200 karakter.";

  const isbnAngka = v.isbn.replace(/[-\s]/g, "");
  if (!v.isbn) errors.isbn = "ISBN wajib diisi.";
  else if (!/^(\d{10}|\d{13})$/.test(isbnAngka))
    errors.isbn = "ISBN harus 10 atau 13 digit angka (tanda hubung boleh).";
  else if (v.isbn.length > 20) errors.isbn = "ISBN maksimal 20 karakter.";

  if (!v.pengarang) errors.pengarang = "Pengarang wajib diisi.";
  else if (v.pengarang.length > 150) errors.pengarang = "Pengarang maksimal 150 karakter.";

  if (!v.penerbit) errors.penerbit = "Penerbit wajib diisi.";
  else if (v.penerbit.length > 150) errors.penerbit = "Penerbit maksimal 150 karakter.";

  if (!/^\d+$/.test(v.tahun_terbit))
    errors.tahun_terbit = "Tahun terbit harus berupa angka.";
  else if (Number(v.tahun_terbit) < 1000 || Number(v.tahun_terbit) > tahunMaks)
    errors.tahun_terbit = `Tahun terbit harus antara 1000 dan ${tahunMaks}.`;

  if (!parseId(v.category_id)) errors.category_id = "Pilih kategori.";

  if (!/^-?\d+$/.test(v.stok_total)) errors.stok_total = "Stok total harus berupa angka.";
  else if (Number(v.stok_total) < 0) errors.stok_total = "Stok total tidak boleh negatif.";
  else if (Number(v.stok_total) > 100000) errors.stok_total = "Stok total terlalu besar.";

  if (!/^\d+$/.test(v.durasi_maks_pinjam))
    errors.durasi_maks_pinjam = "Durasi harus berupa angka (hari).";
  else if (Number(v.durasi_maks_pinjam) < 1 || Number(v.durasi_maks_pinjam) > 365)
    errors.durasi_maks_pinjam = "Durasi harus antara 1 dan 365 hari.";

  if (!/^-?\d+$/.test(v.denda_per_hari)) errors.denda_per_hari = "Denda harus berupa angka.";
  else if (Number(v.denda_per_hari) < 0) errors.denda_per_hari = "Denda tidak boleh negatif.";
  else if (Number(v.denda_per_hari) > 99999999) errors.denda_per_hari = "Denda terlalu besar.";

  if (!v.cover_url) errors.cover_url = "URL cover wajib diisi.";
  else if (!/^https?:\/\/\S+$/i.test(v.cover_url))
    errors.cover_url = "URL cover harus diawali http:// atau https://.";
  else if (v.cover_url.length > 500) errors.cover_url = "URL cover terlalu panjang.";

  return errors;
}

export function validateUlasan({ rating, komentar }) {
  const errors = {};
  const nilai = Number(rating);
  if (!rating) errors.rating = "Rating wajib dipilih.";
  else if (!Number.isInteger(nilai) || nilai < 1 || nilai > 5)
    errors.rating = "Rating harus antara 1 sampai 5.";

  if (komentar && komentar.length > BATAS.komentar)
    errors.komentar = `Komentar maksimal ${BATAS.komentar} karakter.`;
  return errors;
}

// Alasan penolakan pengajuan pinjam (diisi pegawai). Mengembalikan pesan error atau "".
export function validateAlasanTolak(alasan) {
  if (!alasan) return "Alasan penolakan wajib diisi.";
  if (alasan.length > BATAS.alasan)
    return `Alasan penolakan maksimal ${BATAS.alasan} karakter.`;
  return "";
}

// ---------------------------------------------------------------------
// Pengumuman (dikelola Pegawai & Admin)
// ---------------------------------------------------------------------
export const KATEGORI_PENGUMUMAN = ["Operasional", "Layanan", "Acara"];
export const STATUS_PENGUMUMAN = ["Draft", "Published"];

// Memastikan teks "YYYY-MM-DD" benar-benar tanggal yang ada (bukan 2026-02-31).
function tanggalValid(teks) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(teks)) return false;
  const d = new Date(`${teks}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === teks;
}

export function validatePengumuman({ judul, konten, kategori, tanggal_rilis, status }) {
  const errors = {};

  if (!judul) errors.judul = "Judul wajib diisi.";
  else if (judul.length < 5) errors.judul = "Judul minimal 5 karakter.";
  else if (judul.length > 200) errors.judul = "Judul maksimal 200 karakter.";

  if (!konten) errors.konten = "Isi pengumuman wajib diisi.";
  else if (konten.length < 10) errors.konten = "Isi pengumuman minimal 10 karakter.";
  else if (konten.length > 5000) errors.konten = "Isi pengumuman maksimal 5000 karakter.";

  if (!KATEGORI_PENGUMUMAN.includes(kategori))
    errors.kategori = "Pilih kategori pengumuman.";

  if (!tanggal_rilis) errors.tanggal_rilis = "Tanggal rilis wajib diisi.";
  else if (!tanggalValid(tanggal_rilis))
    errors.tanggal_rilis = "Tanggal rilis tidak valid.";

  if (!STATUS_PENGUMUMAN.includes(status))
    errors.status = "Pilih status publikasi.";

  return errors;
}

// ---------------------------------------------------------------------
// Manajemen user (khusus Admin)
// ---------------------------------------------------------------------
export const ROLE_USER = ["admin", "pegawai", "mahasiswa"];

// Dipakai bersama oleh form tambah dan form edit.
function validasiDataUser({ nama_lengkap, email, role, is_active }) {
  const errors = {};

  if (!nama_lengkap) errors.nama_lengkap = "Nama lengkap wajib diisi.";
  else if (nama_lengkap.length < 3) errors.nama_lengkap = "Nama minimal 3 karakter.";
  else if (nama_lengkap.length > 100) errors.nama_lengkap = "Nama maksimal 100 karakter.";

  if (!email) errors.email = "Email wajib diisi.";
  else if (!EMAIL_REGEX.test(email)) errors.email = "Format email tidak valid.";
  else if (email.length > 100) errors.email = "Email maksimal 100 karakter.";

  if (!ROLE_USER.includes(role)) errors.role = "Pilih role pengguna.";

  if (is_active !== undefined && !["true", "false"].includes(is_active))
    errors.is_active = "Pilih status akun.";

  return errors;
}

export function validateUserBaru(v) {
  const errors = validasiDataUser(v);

  if (!v.nomor_identitas) errors.nomor_identitas = "Nomor identitas (NIM/NIP) wajib diisi.";
  else if (!/^[A-Za-z0-9]{3,30}$/.test(v.nomor_identitas))
    errors.nomor_identitas = "Nomor identitas 3-30 karakter, hanya huruf dan angka.";

  if (!v.password) errors.password = "Password wajib diisi.";
  else if (pesanPasswordBaru(v.password)) errors.password = pesanPasswordBaru(v.password);

  return errors;
}

// password (opsional) = reset oleh admin. Kosong berarti password tidak diubah.
export function validateUserEdit(v) {
  const errors = validasiDataUser(v);
  if (v.password) {
    const pesan = pesanPasswordBaru(v.password);
    if (pesan) errors.password = pesan;
  }
  return errors;
}

// ---------------------------------------------------------------------
// Password: ubah sendiri & reset oleh admin
// ---------------------------------------------------------------------
// bcrypt hanya membaca 72 BYTE pertama. Huruf biasa = 1 byte, tapi emoji atau
// huruf beraksen bisa 2-4 byte, jadi panjang dihitung dalam byte supaya
// password tidak diam-diam terpotong.
const PASSWORD_MIN = 8;
const PASSWORD_MAKS_BYTE = 72;

function pesanPasswordBaru(password) {
  if (password.length < PASSWORD_MIN)
    return `Password minimal ${PASSWORD_MIN} karakter.`;
  if (new TextEncoder().encode(password).length > PASSWORD_MAKS_BYTE)
    return `Password maksimal ${PASSWORD_MAKS_BYTE} karakter (emoji dan huruf beraksen dihitung lebih dari satu).`;
  return "";
}

export function validateUbahPassword({ password_lama, password_baru, konfirmasi }) {
  const errors = {};

  if (!password_lama) errors.password_lama = "Password lama wajib diisi.";

  if (!password_baru) errors.password_baru = "Password baru wajib diisi.";
  else {
    const pesan = pesanPasswordBaru(password_baru);
    if (pesan) errors.password_baru = pesan;
    else if (password_lama && password_baru === password_lama)
      errors.password_baru = "Password baru tidak boleh sama dengan password lama.";
  }

  if (!konfirmasi) errors.konfirmasi = "Konfirmasi password wajib diisi.";
  else if (password_baru !== konfirmasi)
    errors.konfirmasi = "Konfirmasi password tidak sama.";

  return errors;
}
