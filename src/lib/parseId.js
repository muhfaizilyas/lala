// Batas atas kolom INTEGER di PostgreSQL (SERIAL = INT4).
// Angka di atas ini membuat query error "value is out of range for type integer".
const ID_MAKS = 2147483647;

// Mengubah nilai dari URL / form menjadi ID yang aman dipakai di query,
// atau null kalau bentuknya tidak valid.
//   parseId("42")                    -> 42
//   parseId("99999999999999999999")  -> null  (melebihi batas INTEGER)
//   parseId("abc") / parseId("1.5") / parseId("-3") / parseId("0") -> null
export function parseId(nilai) {
  const teks = String(nilai ?? "").trim();
  if (!/^\d{1,10}$/.test(teks)) return null; // hanya digit, maksimal 10 karakter
  const angka = Number(teks);
  return angka >= 1 && angka <= ID_MAKS ? angka : null;
}
