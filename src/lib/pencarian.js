// Membersihkan kata kunci pencarian dari URL / form.
// - Karakter NUL (\0) dibuang: PostgreSQL menolaknya ("invalid byte sequence")
//   sehingga halaman error 500.
// - Dipotong 100 karakter: kolom yang dicari paling panjang 200 karakter dan
//   kata kunci sepanjang itu tidak masuk akal.
const PANJANG_MAKS = 100;

export function bersihkanKeyword(nilai) {
  return String(nilai ?? "")
    .replace(/\0/g, "")
    .trim()
    .slice(0, PANJANG_MAKS);
}
