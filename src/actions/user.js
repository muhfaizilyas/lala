"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import pool from "@/lib/db";
import { parseId } from "@/lib/parseId";
import { requireRole } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { validateUserBaru, validateUserEdit } from "@/lib/validation";

const LIST_URL = "/dashboard/admin/user";

function bacaForm(formData) {
  const ambil = (nama) => String(formData.get(nama) ?? "").trim();
  return {
    nama_lengkap: ambil("nama_lengkap"),
    email: ambil("email").toLowerCase(),
    nomor_identitas: ambil("nomor_identitas"),
    role: ambil("role"),
    is_active: ambil("is_active"),
  };
}

// Mengubah unique_violation PostgreSQL menjadi pesan per-field.
function errorDuplikat(err) {
  if (err.code !== "23505") return null;
  if (err.constraint?.includes("email")) return { email: "Email sudah terdaftar." };
  if (err.constraint?.includes("nomor_identitas"))
    return { nomor_identitas: "Nomor identitas sudah terdaftar." };
  return { email: "Email atau nomor identitas sudah terdaftar." };
}

// Transaksi yang masih berjalan dan denda yang belum lunas milik seorang user.
async function ketergantungan(userId) {
  const { rows } = await pool.query(
    `SELECT COUNT(*) FILTER (WHERE status_pinjam IN ('Menunggu Konfirmasi', 'Sedang Dipinjam'))::int AS aktif,
            COUNT(*) FILTER (WHERE status_denda = 'Tertunggak')::int AS denda
       FROM loans WHERE user_id = $1`,
    [userId]
  );
  return rows[0];
}

export async function createUser(prevState, formData) {
  await requireRole("admin"); // setiap action wajib cek role sendiri

  const values = bacaForm(formData);
  const password = String(formData.get("password") ?? "");
  const errors = validateUserBaru({ ...values, password });

  if (!errors.email || !errors.nomor_identitas) {
    const dup = await pool.query(
      "SELECT email, nomor_identitas FROM users WHERE email = $1 OR nomor_identitas = $2",
      [values.email, values.nomor_identitas]
    );
    for (const row of dup.rows) {
      if (row.email === values.email) errors.email = "Email sudah terdaftar.";
      if (row.nomor_identitas === values.nomor_identitas)
        errors.nomor_identitas = "Nomor identitas sudah terdaftar.";
    }
  }
  if (Object.keys(errors).length > 0) return { errors, message: "", values };

  const hash = await bcrypt.hash(password, 10);
  try {
    await pool.query(
      `INSERT INTO users (nama_lengkap, email, password, role, nomor_identitas)
       VALUES ($1, $2, $3, $4, $5)`,
      [values.nama_lengkap, values.email, hash, values.role, values.nomor_identitas]
    );
  } catch (err) {
    const dup = errorDuplikat(err);
    if (dup) return { errors: dup, message: "", values };
    throw err;
  }

  revalidatePath("/", "layout");
  redirect(`${LIST_URL}?status=dibuat`);
}

// Dipanggil dengan .bind(null, id) dari halaman edit
export async function updateUser(id, prevState, formData) {
  const admin = await requireRole("admin");
  const values = bacaForm(formData);

  const { rows } = await pool.query(
    "SELECT id, role, is_active FROM users WHERE id = $1",
    [id]
  );
  const lama = rows[0];
  if (!lama) return { errors: {}, message: "User tidak ditemukan.", values };

  // Admin tidak boleh mengubah role / status akunnya sendiri (mencegah terkunci).
  // Field itu dinonaktifkan di form, jadi nilainya diambil dari database.
  if (lama.id === admin.id) {
    values.role = lama.role;
    values.is_active = String(lama.is_active);
  }

  // Reset password (opsional). Tidak di-trim; kosong = password tidak berubah.
  const passwordBaru = String(formData.get("password") ?? "");
  const errors = validateUserEdit({ ...values, password: passwordBaru });

  if (!errors.email) {
    const dup = await pool.query(
      "SELECT 1 FROM users WHERE email = $1 AND id <> $2",
      [values.email, id]
    );
    if (dup.rows.length > 0) errors.email = "Email sudah terdaftar.";
  }

  // Mahasiswa yang masih punya transaksi aktif / denda tidak boleh berganti role.
  if (!errors.role && lama.role === "mahasiswa" && values.role !== "mahasiswa") {
    const dep = await ketergantungan(id);
    if (dep.aktif > 0 || dep.denda > 0) {
      errors.role =
        "Role tidak bisa diubah: mahasiswa ini masih punya transaksi aktif atau denda tertunggak.";
    }
  }
  if (Object.keys(errors).length > 0) return { errors, message: "", values };

  try {
    if (passwordBaru) {
      // Reset: simpan hash baru dan catat waktunya, sehingga semua sesi lama
      // milik user itu otomatis tidak berlaku.
      const hash = await bcrypt.hash(passwordBaru, 10);
      const sekarang = new Date(Math.floor(Date.now() / 1000) * 1000);
      await pool.query(
        `UPDATE users
            SET nama_lengkap = $1, email = $2, role = $3, is_active = $4,
                password = $6, password_diubah_pada = $7
          WHERE id = $5`,
        [values.nama_lengkap, values.email, values.role, values.is_active === "true", id, hash, sekarang]
      );
    } else {
      await pool.query(
        `UPDATE users
            SET nama_lengkap = $1, email = $2, role = $3, is_active = $4
          WHERE id = $5`,
        [values.nama_lengkap, values.email, values.role, values.is_active === "true", id]
      );
    }
  } catch (err) {
    const dup = errorDuplikat(err);
    if (dup) return { errors: dup, message: "", values };
    throw err;
  }

  // Admin me-reset password akunnya sendiri: sesi lamanya ikut tercabut,
  // jadi buat sesi baru agar tidak terlempar ke halaman login.
  if (passwordBaru && lama.id === admin.id) await createSession(admin.id);

  revalidatePath("/", "layout");
  redirect(`${LIST_URL}?status=diubah`);
}

export async function deleteUser(prevState, formData) {
  const admin = await requireRole("admin");

  const id = parseId(formData.get("id"));
  if (!id) return { message: "ID tidak valid." };

  if (id === admin.id) return { message: "Kamu tidak bisa menghapus akunmu sendiri." };

  const { rows } = await pool.query("SELECT 1 FROM users WHERE id = $1", [id]);
  if (rows.length === 0) return { message: "User tidak ditemukan." };

  // Proteksi relasi data: transaksi aktif / denda belum lunas mencegah penghapusan.
  const dep = await ketergantungan(id);
  if (dep.aktif > 0) {
    return { message: `Tidak bisa dihapus: masih ada ${dep.aktif} transaksi aktif.` };
  }
  if (dep.denda > 0) {
    return { message: `Tidak bisa dihapus: masih ada ${dep.denda} denda yang belum lunas.` };
  }

  await pool.query("DELETE FROM users WHERE id = $1", [id]);

  revalidatePath("/", "layout");
  redirect(`${LIST_URL}?status=dihapus`);
}
