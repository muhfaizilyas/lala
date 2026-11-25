/** @type {import('next').NextConfig} */
const nextConfig = {
  // Jangan tampilkan "X-Powered-By: Next.js" di setiap respons.
  poweredByHeader: false,

  // Header keamanan dasar untuk semua halaman.
  // CSP sengaja tidak dipasang: sampul buku dimuat dari URL bebas (https://...)
  // dan CSP yang ketat bisa memblokirnya.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
