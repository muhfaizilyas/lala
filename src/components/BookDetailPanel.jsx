import Link from "next/link";
import BookCover from "@/components/BookCover";
import { formatRupiah } from "@/lib/format";

// Isi panel kanan di halaman Jelajahi. b = baris buku dari query katalog.
export default function BookDetailPanel({ b }) {
  if (!b) {
    return (
      <p className="text-sm text-[#cad5e6]">Pilih sebuah buku untuk melihat detailnya.</p>
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
      <p className="text-[10px] font-bold uppercase tracking-[1.7px] text-[#adbed9]">Detail buku</p>
      <BookCover
        src={b.cover_url}
        judul={b.judul}
        id={b.id}
        className="mx-auto mb-[18px] mt-[26px] w-3/4 max-w-[165px] rounded shadow-[5px_7px_10px_#08172d] max-[640px]:max-w-[110px]"
      />
      <h2 className="my-2 font-serif text-[26px] font-semibold leading-tight">{b.judul}</h2>
      <p className="text-[13px] text-[#cad5e6]">{b.pengarang}</p>

      <div className="my-[22px] flex justify-around gap-2 border-y border-[#40516d] py-[13px] text-[13px]">
        <span>
          {b.tahun_terbit}
          <small className="mt-1 block text-[10px] text-[#aec1dc]">Tahun</small>
        </span>
        <span>
          {b.stok_tersedia}
          <small className="mt-1 block text-[10px] text-[#aec1dc]">Stok</small>
        </span>
        <span>
          {b.rating ? `★ ${b.rating}` : "—"}
          <small className="mt-1 block text-[10px] text-[#aec1dc]">Rating</small>
        </span>
      </div>

      <p className="text-left text-[10px] font-bold uppercase tracking-[1.7px] text-[#adbed9]">Informasi</p>
      <dl className="mx-auto mb-5 mt-2 max-w-[450px] space-y-1.5 text-left text-[13px] text-[#dce4ef]">
        <div className="flex justify-between gap-3">
          <dt className="text-[#aec1dc]">Kategori</dt>
          <dd className="text-right">{b.kategori}</dd>
        </div>
        {info.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <dt className="text-[#aec1dc]">{k}</dt>
            <dd className="break-all text-right">{v}</dd>
          </div>
        ))}
      </dl>

      <Link
        href={`/buku/${b.id}`}
        className="block w-full rounded-[7px] bg-[#3869e0] p-[11px] text-center font-semibold !text-white hover:bg-[#2f5bc7]"
      >
        {b.stok_tersedia > 0 ? "Lihat detail & ajukan pinjam" : "Lihat detail & reservasi"}
      </Link>
    </>
  );
}
