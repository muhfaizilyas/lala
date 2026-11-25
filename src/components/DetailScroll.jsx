"use client";

import { useEffect, useRef } from "react";

// Di layar HP panel detail berada di bawah daftar. Saat pengguna MEMILIH buku
// (parameter ?pilih= berubah), geser layar ke panel itu. bookId harus berupa
// pilihan eksplisit, bukan buku bawaan, supaya mengganti kategori atau urutan
// tidak membuat layar melompat. Tidak berefek di layar yang lebih lebar.
export default function DetailScroll({ bookId, children }) {
  const ref = useRef(null);
  const sebelumnya = useRef(bookId);

  useEffect(() => {
    if (sebelumnya.current === bookId) return;
    sebelumnya.current = bookId;
    if (bookId && window.innerWidth <= 640) {
      ref.current?.scrollIntoView({ block: "start" });
    }
  }, [bookId]);

  return <div ref={ref}>{children}</div>;
}
