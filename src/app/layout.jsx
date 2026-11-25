import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans-app",
  display: "swap",
});

export const metadata = {
  title: {
    default: "RakBaca",
    template: "%s · RakBaca",
  },
  description: "Sistem manajemen perpustakaan kampus RakBaca",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={plusJakarta.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
