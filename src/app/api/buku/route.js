import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { parseId } from "@/lib/parseId";
import { bersihkanKeyword } from "@/lib/pencarian";
import { SQL_STOK_BEBAS } from "@/lib/reservasi";

// GET /api/buku?q=clean&kategori=1
// Data katalog bersifat publik (sama dengan halaman /katalog), jadi tanpa login.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = bersihkanKeyword(searchParams.get("q"));
  const kategori = searchParams.get("kategori") ?? "";
  const kategoriId = parseId(kategori);

  try {
    const { rows } = await pool.query(
      `SELECT b.id, b.judul, b.isbn, b.pengarang, b.penerbit, b.tahun_terbit,
              ${SQL_STOK_BEBAS} AS stok_tersedia, c.nama AS kategori,
              ROUND(AVG(r.rating), 1)::float AS rating
         FROM books b
         JOIN categories c ON c.id = b.category_id
         LEFT JOIN loans l   ON l.book_id = b.id
         LEFT JOIN reviews r ON r.loan_id = l.id
        WHERE ($1 = ''
               OR b.judul     ILIKE '%' || $1 || '%'
               OR b.pengarang ILIKE '%' || $1 || '%'
               OR c.nama      ILIKE '%' || $1 || '%')
          AND ($2::int IS NULL OR b.category_id = $2::int)
        GROUP BY b.id, c.nama
        ORDER BY b.judul`,
      [q, kategoriId]
    );
    return NextResponse.json({ total: rows.length, data: rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
