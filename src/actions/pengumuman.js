"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import pool from "@/lib/db";
import { parseId } from "@/lib/parseId";
import { requireRole } from "@/lib/auth";
import { validatePengumuman } from "@/lib/validation";

const LIST_URL = "/dashboard/pengumuman";

function bacaForm(formData) {
  const ambil = (nama) => String(formData.get(nama) ?? "").trim();
  return {
    judul: ambil("judul"),
    konten: ambil("konten"),
    kategori: ambil("kategori"),
    tanggal_rilis: ambil("tanggal_rilis"),
    status: ambil("status"),
  };
}

// Halaman publik (beranda, daftar, detail) perlu dimuat ulang setelah data berubah.
function segarkan() {
  revalidatePath("/", "layout");
}

export async function createPengumuman(prevState, formData) {
  const staf = await requireRole("admin", "pegawai");

  const values = bacaForm(formData);
  const errors = validatePengumuman(values);
  if (Object.keys(errors).length > 0) return { errors, message: "", values };

  await pool.query(
    `INSERT INTO announcements (judul, konten, kategori, tanggal_rilis, status, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [values.judul, values.konten, values.kategori, values.tanggal_rilis, values.status, staf.id]
  );

  segarkan();
  redirect(`${LIST_URL}?status=dibuat`);
}

// Dipanggil dengan .bind(null, id) dari halaman edit
export async function updatePengumuman(id, prevState, formData) {
  await requireRole("admin", "pegawai");

  const values = bacaForm(formData);
  const errors = validatePengumuman(values);
  if (Object.keys(errors).length > 0) return { errors, message: "", values };

  const result = await pool.query(
    `UPDATE announcements
        SET judul = $1, konten = $2, kategori = $3, tanggal_rilis = $4, status = $5
      WHERE id = $6`,
    [values.judul, values.konten, values.kategori, values.tanggal_rilis, values.status, id]
  );
  if (result.rowCount === 0) {
    return { errors: {}, message: "Pengumuman tidak ditemukan.", values };
  }

  segarkan();
  redirect(`${LIST_URL}?status=diubah`);
}

export async function deletePengumuman(prevState, formData) {
  await requireRole("admin", "pegawai");

  const id = parseId(formData.get("id"));
  if (!id) return { message: "ID tidak valid." };

  const result = await pool.query("DELETE FROM announcements WHERE id = $1", [id]);
  if (result.rowCount === 0) return { message: "Pengumuman tidak ditemukan." };

  segarkan();
  redirect(`${LIST_URL}?status=dihapus`);
}
