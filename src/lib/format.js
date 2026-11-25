// Tanggal dari PostgreSQL dikirim sebagai teks "YYYY-MM-DD" (lihat ::text di query)
// supaya tidak terkena pergeseran zona waktu.
export function formatTanggal(iso) {
  if (!iso) return "-";
  const d = new Date(`${String(iso).slice(0, 10)}T00:00:00Z`);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatRupiah(nilai) {
  return "Rp " + Number(nilai ?? 0).toLocaleString("id-ID");
}
