import AppFrame from "@/components/AppFrame";
import { KatalogPanel, PengumumanPanel } from "@/components/SectionPanels";

// Untuk halaman detail yang boleh dibuka siapa saja (detail buku, detail pengumuman).
// section = "katalog" atau "pengumuman"; user null berarti Guest.
// aktif = penanda item aktif di panel kiri (lihat SectionPanels).
export default function DetailShell({ user, section = "katalog", aktif, title, subtitle, actions, children }) {
  const panel =
    section === "pengumuman" ? (
      <PengumumanPanel user={user} aktif={aktif} />
    ) : (
      <KatalogPanel aktif={aktif} />
    );
  return (
    <AppFrame user={user} section={section} panel={panel} title={title} subtitle={subtitle} actions={actions}>
      {children}
    </AppFrame>
  );
}
