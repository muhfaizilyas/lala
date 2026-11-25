import AppFrame from "@/components/AppFrame";
import { DashboardPanel, PengumumanPanel } from "@/components/SectionPanels";

// Dipakai semua halaman yang butuh login. section menentukan menu utama yang
// aktif: halaman kelola pengumuman memakai section="pengumuman".
export default function DashboardShell({ children, user, title, subtitle, actions, section = "dashboard" }) {
  const panel =
    section === "pengumuman" ? <PengumumanPanel user={user} /> : <DashboardPanel user={user} />;
  return (
    <AppFrame user={user} section={section} panel={panel} title={title} subtitle={subtitle} actions={actions}>
      {children}
    </AppFrame>
  );
}
