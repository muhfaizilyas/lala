// Menyusun URL halaman katalog dari kombinasi filter. Dipakai oleh halaman
// katalog dan panel kategori di sebelah kiri supaya filter tidak saling menimpa.
export function buatHref({ q, kategori, sort, pilih } = {}) {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (kategori) p.set("kategori", String(kategori));
  if (sort && sort !== "judul") p.set("sort", sort);
  if (pilih) p.set("pilih", String(pilih));
  const s = p.toString();
  return s ? `/katalog?${s}` : "/katalog";
}
