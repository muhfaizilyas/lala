// Pembuat file CSV yang aman dibuka di Excel.
//
// 1. Penanda UTF-8 (BOM) di awal file supaya Excel membaca huruf non-ASCII benar.
// 2. Sel teks yang diawali = + - @ (atau tab / CR) diberi awalan ' supaya Excel
//    tidak menjalankannya sebagai rumus (CSV injection).
// 3. Sel yang memuat pemisah, tanda kutip, atau baris baru dibungkus tanda kutip.

const BOM = "\uFEFF";
const AWAL_RUMUS = /^[=+\-@\t\r]/;

// Satu sel teks. Angka murni sebaiknya lewat sel() dengan tipe number.
function sel(nilai, pemisah = ",") {
  if (nilai === null || nilai === undefined) return "";

  // Angka asli (mis. nominal denda) ditulis apa adanya; nilai negatif pun bukan rumus.
  if (typeof nilai === "number") return Number.isFinite(nilai) ? String(nilai) : "";

  let teks = String(nilai);
  if (AWAL_RUMUS.test(teks)) teks = `'${teks}`;

  if (teks.includes(pemisah) || /["\r\n]/.test(teks)) {
    teks = `"${teks.replaceAll('"', '""')}"`;
  }
  return teks;
}

// baris = array nilai; semuaBaris = array dari baris.
// Baris kosong ([]) menghasilkan baris pemisah kosong.
export function buatCsv(semuaBaris, pemisah = ",") {
  const isi = semuaBaris
    .map((baris) => baris.map((n) => sel(n, pemisah)).join(pemisah))
    .join("\r\n");
  return BOM + isi + "\r\n";
}
