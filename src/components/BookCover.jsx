"use client";

import { useState } from "react";

// Warna cadangan untuk sampul yang belum punya gambar (mengikuti palet desain).
const PALET = [
  { bg: "#1b3358", fg: "#f4ecd8" },
  { bg: "#c4562e", fg: "#f8eedd" },
  { bg: "#e8b44c", fg: "#2a1d08" },
  { bg: "#7ba08a", fg: "#10241a" },
];

// Sampul buku rasio 0.68. Jika src kosong atau gagal dimuat, tampil blok warna
// berisi judul buku, jadi tidak pernah ada gambar rusak.
// compact = true untuk thumbnail kecil (judul disembunyikan).
export default function BookCover({ src, judul = "", id = 0, compact = false, className = "" }) {
  const [gagal, setGagal] = useState(false);
  const warna = PALET[Math.abs(Number(id) || 0) % PALET.length];
  const tampilGambar = src && !gagal;

  return (
    <span
      className={`@container relative block aspect-[0.68] overflow-hidden rounded ${className}`}
      style={{ backgroundColor: warna.bg, color: warna.fg }}
    >
      {!tampilGambar && !compact ? (
        <span
          className="absolute inset-0 flex items-center justify-center p-[10%] text-center font-serif font-semibold leading-tight"
          style={{ fontSize: "13cqw" }}
        >
          {judul}
        </span>
      ) : null}
      {tampilGambar ? (
        <>
          {/* <img> biasa dipilih karena URL sampul bisa berasal dari domain mana pun */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={judul ? `Sampul ${judul}` : ""}
            loading="lazy"
            onError={() => setGagal(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </>
      ) : null}
    </span>
  );
}
