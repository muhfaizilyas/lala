import pool from "@/lib/db";
import { PANEL_DASHBOARD, ROLE_LABEL } from "@/lib/navigation";
import { KATEGORI_PENGUMUMAN } from "@/lib/validation";
import { buatHref } from "@/lib/katalog";
import PanelLinks from "@/components/PanelLinks";

// Panel kiri untuk tiap bagian. Semuanya hanya menyusun daftar tautan.

export function DashboardPanel({ user }) {
  const items = PANEL_DASHBOARD[user.role] ?? [];
  return <PanelLinks label="Menu dashboard" grup={[{ judul: ROLE_LABEL[user.role], items }]} />;
}

// aktif: null = "Semua kategori", angka = id kategori, undefined = tidak ada yang aktif
export async function KatalogPanel({ aktif, q = "", sort = "judul", pilih = null }) {
  const { rows } = await pool.query(
    `SELECT c.id, c.nama, COUNT(b.id)::int AS jumlah
       FROM categories c
       LEFT JOIN books b ON b.category_id = c.id
      GROUP BY c.id
      ORDER BY c.nama`
  );
  const items = [
    { href: buatHref({ q, sort, pilih }), label: "Semua kategori", ikon: "grid", aktif: aktif === null, tetapScroll: true },
    ...rows.map((c) => ({
      href: buatHref({ q, kategori: c.id, sort, pilih }),
      label: c.nama,
      ikon: "tag",
      badge: c.jumlah,
      aktif: aktif === c.id,
      tetapScroll: true,
    })),
  ];
  return <PanelLinks label="Kategori buku" grup={[{ judul: "Kategori", items }]} />;
}

// aktif: "" = "Semua", nama kategori, undefined = tidak ada yang aktif
export function PengumumanPanel({ user, aktif }) {
  const grup = [
    {
      judul: "Kategori",
      items: [
        { href: "/pengumuman", label: "Semua pengumuman", ikon: "bell", aktif: aktif === "" },
        ...KATEGORI_PENGUMUMAN.map((k) => ({
          href: `/pengumuman?kategori=${k}`,
          label: k,
          ikon: "tag",
          aktif: aktif === k,
        })),
      ],
    },
  ];
  if (user && (user.role === "admin" || user.role === "pegawai")) {
    grup.push({
      judul: "Kelola",
      items: [
        { href: "/dashboard/pengumuman", label: "Kelola Pengumuman", ikon: "edit" },
        { href: "/dashboard/pengumuman/baru", label: "Buat Pengumuman", ikon: "plus" },
      ],
    });
  }
  return <PanelLinks label="Menu pengumuman" grup={grup} />;
}
