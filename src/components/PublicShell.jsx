import AppFrame from "@/components/AppFrame";

// Beranda: header dengan empat menu utama, tanpa panel kiri.
export default function PublicShell({ children, user = null }) {
  return (
    <AppFrame user={user} section="beranda" penuh>
      {children}
      <footer className="mt-10 border-t border-slate-200 bg-white/70 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} RakBaca · Perpustakaan Kampus
      </footer>
    </AppFrame>
  );
}
