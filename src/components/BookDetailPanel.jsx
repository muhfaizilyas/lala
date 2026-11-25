import Link from "next/link";
import BookCover from "@/components/BookCover";
import { formatRupiah } from "@/lib/format";

// Isi panel kanan di halaman Jelajahi. b = baris buku dari query katalog.
export default function BookDetailPanel({ b }) {
  if (!b) {
    return (
      <p className="text-sm text-slate-200">Pilih sebuah buku untuk melihat detailnya.</p>
    );
  }

  const info = [
    ["Penerbit", b.penerbit],
    ["ISBN", b.isbn],
    ["Lama pinjam", `${b.durasi_maks_pinjam} hari`],
    ["Denda per hari", formatRupiah(b.denda_per_hari)],
  ];

  return (
    <>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-200">Detail buku</p>
      <BookCover
        src={b.cover_url}
        judul={b.judul}
        id={b.id}
        className="mx-auto mb-5 mt-6 w-3/4 max-w-[165px] rounded-lg shadow-[0_12px_24px_-8px_rgba(0,0,0,0.5)] max-[640px]:max-w-[110px]"
      />
      <h2 className="my-2 text-2xl font-extrabold leading-tight tracking-tight text-white">{b.judul}</h2>
      <p className="text-sm text-slate-200">{b.pengarang}</p>

      <div className="my-5 flex justify-around gap-2 border-y border-white/15 py-3.5 text-sm font-semibold text-white">
        <span>
          {b.tahun_terbit}
          <small className="mt-1 block text-[11px] font-medium text-blue-200">Tahun</small>
        </span>
        <span>
          {b.stok_tersedia}
          <small className="mt-1 block text-[11px] font-medium text-blue-200">Stok</small>
        </span>
        <span>
          {b.rating ? `★ ${b.rating}` : "-"}
          <small className="mt-1 block text-[11px] font-medium text-blue-200">Rating</small>
        </span>
      </div>

      <p className="text-left text-[11px] font-bold uppercase tracking-[0.16em] text-blue-200">Informasi</p>
      <dl className="mx-auto mb-6 mt-2.5 max-w-[450px] space-y-2 text-left text-[13px] text-slate-100">
        <div className="flex justify-between gap-3">
          <dt className="text-blue-200">Kategori</dt>
          <dd className="text-right font-medium">{b.kategori}</dd>
        </div>
        {info.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <dt className="text-blue-200">{k}</dt>
            <dd className="break-all text-right font-medium">{v}</dd>
          </div>
        ))}
      </dl>

      <Link
        href={`/buku/${b.id}`}
        className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[#2563eb] px-4 py-2.5 text-center text-sm font-semibold !text-white transition hover:bg-[#1d4ed8]"
      >
        {b.stok_tersedia > 0 ? "Lihat detail & ajukan pinjam" : "Lihat detail & reservasi"}
      </Link>
    </>
  );
}
