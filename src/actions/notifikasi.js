"use server";

import { revalidatePath } from "next/cache";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";

// Menandai semua notifikasi milik mahasiswa yang sedang login sebagai sudah dibaca.
// Format (prevState, formData) -> { ok, message }, kompatibel dengan AksiForm.
export async function tandaiSemuaDibaca() {
  const user = await requireRole("mahasiswa");

  await pool.query(
    "UPDATE notifications SET sudah_dibaca = TRUE WHERE user_id = $1 AND sudah_dibaca = FALSE",
    [user.id]
  );

  revalidatePath("/dashboard/mahasiswa");
  return { ok: true, message: "Semua notifikasi ditandai sudah dibaca." };
}
