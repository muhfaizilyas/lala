"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import pool from "@/lib/db";
import { parseId } from "@/lib/parseId";
import { requireRole } from "@/lib/auth";
import { jalankanTransaksi, sapuBuku, SQL_DICADANGKAN } from "@/lib/reservasi";
import { cekBlokir, pesanBlokir } from "@/lib/blokir";

const gagal = (message) => ({ ok: false, message });
const berhasil = (message) => ({ ok: true, message });

// Mahasiswa masuk antrean untuk buku yang tidak bisa dipinjam sekarang.
export async function buatReservasi(prevState, formData) {
  const user = await requireRole("mahasiswa");
  const bookId = parseId(formData.get("id"));
  if (!bookId) return gagal("ID buku tidak valid.");

  const hasil = await jalankanTransaksi(async (db) => {
    // sapuBuku mengunci baris buku, sekaligus memastikan status antrean terbaru.
    await sapuBuku(db, bookId);

    const { rows } = await db.query(
      `SELECT b.stok_tersedia, ${SQL_DICADANGKAN} AS dicadangkan
         FROM books b WHERE b.id = $1`,
      [bookId]
    );
    const buku = rows[0];
    if (!buku) return gagal("Buku tidak ditemukan.");

    // Aturan blokir yang sama dengan peminjaman.
    const blokir = await cekBlokir(db, user.id);
    if (blokir.alasan) return gagal(pesanBlokir(blokir, "reservasi"));

    const { rows: aktif } = await db.query(
      `SELECT 1 FROM loans
        WHERE user_id = $1 AND book_id = $2
          AND status_pinjam IN ('Menunggu Konfirmasi', 'Sedang Dipinjam') LIMIT 1`,
      [user.id, bookId]
    );
    if (aktif.length > 0) {
      return gagal("Kamu sudah punya pengajuan atau peminjaman aktif untuk buku ini.");
    }

    if (buku.stok_tersedia - buku.dicadangkan > 0) {
      return gagal("Buku ini masih tersedia, langsung ajukan pinjam saja.");
    }

    try {
      await db.query("SAVEPOINT sebelum_reservasi");
      await db.query(
        "INSERT INTO reservations (user_id, book_id) VALUES ($1, $2)",
        [user.id, bookId]
      );
    } catch (err) {
      // unique index uq_reservations_aktif
      if (err.code === "23505") {
        await db.query("ROLLBACK TO SAVEPOINT sebelum_reservasi");
        return gagal("Kamu sudah punya reservasi aktif untuk buku ini.");
      }
      throw err;
    }
    return berhasil("Reservasi dibuat.");
  });

  if (!hasil.ok) return hasil;

  revalidatePath("/", "layout");
  redirect("/dashboard/mahasiswa?status=reservasi#reservasi");
}

// Mahasiswa membatalkan reservasinya sendiri (yang masih Menunggu / Siap Diambil).
// Kalau yang dibatalkan sedang memegang eksemplar, antrean berikutnya langsung naik.
export async function batalkanReservasi(prevState, formData) {
  const user = await requireRole("mahasiswa");
  const id = parseId(formData.get("id"));
  if (!id) return gagal("ID reservasi tidak valid.");

  const { rows: awal } = await pool.query(
    "SELECT book_id FROM reservations WHERE id = $1 AND user_id = $2",
    [id, user.id]
  );
  if (awal.length === 0) return gagal("Reservasi tidak ditemukan.");

  const hasil = await jalankanTransaksi(async (db) => {
    // Kunci buku dulu (urutan yang sama dengan action lain), baru ubah reservasi.
    await db.query("SELECT 1 FROM books WHERE id = $1 FOR UPDATE", [awal[0].book_id]);

    const { rowCount } = await db.query(
      `UPDATE reservations SET status = 'Dibatalkan'
        WHERE id = $1 AND user_id = $2 AND status IN ('Menunggu', 'Siap Diambil')`,
      [id, user.id]
    );
    if (rowCount === 0) return gagal("Reservasi ini sudah tidak aktif.");

    await sapuBuku(db, awal[0].book_id);
    return berhasil("Reservasi dibatalkan.");
  });

  if (hasil.ok) revalidatePath("/", "layout");
  return hasil;
}
