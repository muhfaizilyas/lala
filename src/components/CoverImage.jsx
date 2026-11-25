"use client";

import { useState } from "react";

// Sampul buku dari URL. Kalau URL kosong atau gambar gagal dimuat, komponen
// ini tidak menampilkan apa-apa sehingga gradien bawaan di belakangnya tetap terlihat.
// Dipakai di dalam elemen yang punya class "relative".
export default function CoverImage({ src, alt = "" }) {
  const [gagal, setGagal] = useState(false);
  if (!src || gagal) return null;

  return (
    <>
      {/* <img> biasa dipilih karena URL sampul bisa berasal dari domain mana pun */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setGagal(true)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* lapisan gelap agar teks putih di atas sampul tetap terbaca */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-slate-950/10" />
    </>
  );
}
