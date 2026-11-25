import "./globals.css";

export const metadata = {
  title: {
    default: "RakBaca",
    template: "%s · RakBaca",
  },
  description: "Sistem manajemen perpustakaan kampus RakBaca",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
