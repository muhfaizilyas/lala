"use server";

import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { parseId } from "@/lib/parseId";
import { requireRole } from "@/lib/auth";
import { validateKategori } from "@/lib/validation";

const LIST_URL = "/dashboard/admin/kategori";

function bacaForm(formData) {
  return {
    nama: String(formData.get("nama") ?? "").trim(),
    kode: String(formData.get("kode") ?? "").trim().toUpperCase(),
    deskripsi: String(formData.get("deskripsi") ?? "").trim(),
  };
}

// Mengubah error unique_violation dari PostgreSQL menjadi pesan per-field.
function errorDuplikat(err) {
  if (err.code !== "23505") return null;
  if (err.constraint?.includes("nama")) return { nama: "Nama kategori sudah dipakai." };
  if (err.constraint?.includes("kode")) return { kode: "Kode kategori sudah dipakai." };
  return { nama: "Nama atau kode sudah dipakai." };
}

export async function createKategori(prevState, formData) {
  await requireRole("admin"); // setiap action wajib cek role sendiri

  const values = bacaForm(formData);
  const errors = validateKategori(values);
  if (Object.keys(errors).length > 0) return { errors, message: "", values };

  try {
    await pool.query(
      "INSERT INTO categories (nama, kode, deskripsi) VALUES ($1, $2, $3)",
      [values.nama, values.kode, values.deskripsi || null]
    );
  } catch (err) {
    const dup = errorDuplikat(err);
    if (dup) return { errors: dup, message: "", values };
    throw err;
  }

  redirect(`${LIST_URL}?status=dibuat`);
}

// Dipanggil dengan .bind(null, id) dari halaman edit
export async function updateKategori(id, prevState, formData) {
  await requireRole("admin");

  const values = bacaForm(formData);
  const errors = validateKategori(values);
  if (Object.keys(errors).length > 0) return { errors, message: "", values };

  try {
    const result = await pool.query(
      "UPDATE categories SET nama = $1, kode = $2, deskripsi = $3 WHERE id = $4",
      [values.nama, values.kode, values.deskripsi || null, id]
    );
    if (result.rowCount === 0) {
      return { errors: {}, message: "Kategori tidak ditemukan.", values };
    }
  } catch (err) {
    const dup = errorDuplikat(err);
    if (dup) return { errors: dup, message: "", values };
    throw err;
  }

  redirect(`${LIST_URL}?status=diubah`);
}

export async function deleteKategori(prevState, formData) {
  await requireRole("admin");

  const id = parseId(formData.get("id"));
  if (!id) return { message: "ID tidak valid." };

  // Aturan: kategori yang masih punya buku tidak boleh dihapus
  const { rows } = await pool.query(
    "SELECT COUNT(*)::int AS jumlah FROM books WHERE category_id = $1",
    [id]
  );
  if (rows[0].jumlah > 0) {
    return {
      message: `Tidak bisa dihapus: masih ada ${rows[0].jumlah} buku di kategori ini.`,
    };
  }

  try {
    await pool.query("DELETE FROM categories WHERE id = $1", [id]);
  } catch (err) {
    // 23503 = foreign_key_violation (jaga-jaga, FK ON DELETE RESTRICT)
    if (err.code === "23503") {
      return { message: "Tidak bisa dihapus: kategori masih dipakai buku." };
    }
    throw err;
  }

  redirect(`${LIST_URL}?status=dihapus`);
}
