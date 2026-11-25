"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";
import { dashboardPath, requireUser } from "@/lib/auth";
import { validateLogin, validateRegister, validateUbahPassword } from "@/lib/validation";

// Hash palsu (cost 10, sama dengan hash asli) untuk email yang tidak terdaftar.
// Dengan begitu bcrypt.compare tetap berjalan dan waktu respons login sama,
// sehingga penyerang tidak bisa menebak email terdaftar dari lamanya respons.
const HASH_DUMMY = bcrypt.hashSync("password-palsu-untuk-menyamakan-waktu", 10);

// state awal form: { errors: {}, message: "", values: {} }

export async function loginAction(prevState, formData) {
  const values = {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
  };
  const password = String(formData.get("password") ?? "");

  const errors = validateLogin({ email: values.email, password });
  if (Object.keys(errors).length > 0) {
    return { errors, message: "", values };
  }

  const { rows } = await pool.query(
    "SELECT id, password, role, is_active FROM users WHERE email = $1",
    [values.email]
  );
  const user = rows[0];

  // Pesan sengaja disamakan agar tidak membocorkan email mana yang terdaftar.
  const salah = { errors: {}, message: "Email atau password salah.", values };
  // Selalu jalankan compare, juga saat email tidak ditemukan (lawan hash palsu).
  const cocok = await bcrypt.compare(password, user ? user.password : HASH_DUMMY);
  if (!user || !cocok) return salah;

  if (!user.is_active) {
    return {
      errors: {},
      message: "Akun kamu dinonaktifkan. Hubungi admin perpustakaan.",
      values,
    };
  }

  await createSession(user.id);
  redirect(dashboardPath(user.role)); // redirect harus di luar try/catch
}

export async function registerAction(prevState, formData) {
  const values = {
    nama_lengkap: String(formData.get("nama_lengkap") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    nomor_identitas: String(formData.get("nomor_identitas") ?? "").trim(),
  };
  const password = String(formData.get("password") ?? "");
  const konfirmasi = String(formData.get("konfirmasi") ?? "");

  const errors = validateRegister({ ...values, password, konfirmasi });
  if (Object.keys(errors).length > 0) {
    return { errors, message: "", values };
  }

  // Cek duplikat email / NIM
  const dup = await pool.query(
    "SELECT email, nomor_identitas FROM users WHERE email = $1 OR nomor_identitas = $2",
    [values.email, values.nomor_identitas]
  );
  for (const row of dup.rows) {
    if (row.email === values.email) errors.email = "Email sudah terdaftar.";
    if (row.nomor_identitas === values.nomor_identitas)
      errors.nomor_identitas = "NIM sudah terdaftar.";
  }
  if (Object.keys(errors).length > 0) {
    return { errors, message: "", values };
  }

  const hash = await bcrypt.hash(password, 10);

  let userId;
  try {
    // role SELALU 'mahasiswa' dan ditentukan di server, bukan dari form.
    const { rows } = await pool.query(
      `INSERT INTO users (nama_lengkap, email, password, role, nomor_identitas)
       VALUES ($1, $2, $3, 'mahasiswa', $4)
       RETURNING id`,
      [values.nama_lengkap, values.email, hash, values.nomor_identitas]
    );
    userId = rows[0].id;
  } catch (err) {
    // 23505 = unique_violation (jaga-jaga kalau dua orang daftar bersamaan)
    if (err.code === "23505") {
      return {
        errors: {},
        message: "Email atau NIM sudah terdaftar.",
        values,
      };
    }
    throw err;
  }

  await createSession(userId);
  redirect(dashboardPath("mahasiswa"));
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}

// Ubah password milik sendiri (semua peran). Dipakai lewat useActionState.
// Setelah berhasil, password_diubah_pada diisi sehingga sesi di perangkat lain
// otomatis tidak berlaku, lalu sesi perangkat ini dibuat ulang agar tetap masuk.
export async function ubahPassword(prevState, formData) {
  const user = await requireUser();

  // Password tidak di-trim: spasi di awal/akhir adalah bagian dari password.
  const password_lama = String(formData.get("password_lama") ?? "");
  const password_baru = String(formData.get("password_baru") ?? "");
  const konfirmasi = String(formData.get("konfirmasi") ?? "");

  const errors = validateUbahPassword({ password_lama, password_baru, konfirmasi });
  if (Object.keys(errors).length > 0) return { ok: false, errors, message: "" };

  const { rows } = await pool.query("SELECT password FROM users WHERE id = $1", [user.id]);
  const hashLama = rows[0]?.password;
  // Untuk akun yang hilang di tengah jalan, tetap jalankan compare (waktu respons sama).
  const cocok = await bcrypt.compare(password_lama, hashLama ?? HASH_DUMMY);
  if (!hashLama || !cocok) {
    return { ok: false, errors: { password_lama: "Password lama salah." }, message: "" };
  }

  const hash = await bcrypt.hash(password_baru, 10);
  // Waktu diambil dari server aplikasi (dibulatkan ke detik) agar konsisten dengan
  // iat token yang dibuat di server yang sama.
  const sekarang = new Date(Math.floor(Date.now() / 1000) * 1000);
  await pool.query(
    "UPDATE users SET password = $1, password_diubah_pada = $2 WHERE id = $3",
    [hash, sekarang, user.id]
  );

  await createSession(user.id);
  return {
    ok: true,
    errors: {},
    message: "Password berhasil diubah. Perangkat lain yang sedang masuk otomatis keluar.",
  };
}
