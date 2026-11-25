import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "session";
const DURASI_HARI = 7;

const PANJANG_MIN_SECRET = 32;

function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET belum diisi di .env.local");
  }
  // HS256 butuh kunci yang cukup panjang; secret pendek mudah ditebak (brute force).
  if (secret.length < PANJANG_MIN_SECRET) {
    throw new Error(
      `SESSION_SECRET terlalu pendek (${secret.length} karakter). Minimal ${PANJANG_MIN_SECRET} karakter acak.`
    );
  }
  return new TextEncoder().encode(secret);
}

// Membuat cookie sesi berisi token JWT yang DITANDATANGANI (tidak bisa dipalsukan).
// Token hanya menyimpan id user; data lain selalu diambil ulang dari database.
export async function createSession(userId) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURASI_HARI}d`)
    .sign(getKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true, // tidak bisa dibaca JavaScript di browser
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURASI_HARI * 24 * 60 * 60,
  });
}

// Mengembalikan { userId, iat } kalau cookie valid, selain itu null.
// iat = detik Unix saat token dibuat; dipakai untuk mencabut sesi lama
// setelah password diubah (lihat getCurrentUser di lib/auth.js).
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"],
    });
    return { userId: payload.userId, iat: payload.iat };
  } catch {
    return null; // token rusak / kedaluwarsa
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
