/** @type {import('next').NextConfig} */
const nextConfig = {
  // ═══════════════════════════════════════════════════════════
  // 1. تنظیمات تصاویر
  // ═══════════════════════════════════════════════════════════
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "nextsafar.local" },
      { protocol: "https", hostname: "nextsafar.local" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "https", hostname: "127.0.0.1" },
      { protocol: "https", hostname: "nextsafar.com" },
      { protocol: "https", hostname: "**.nextsafar.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    dangerouslyAllowLocalIP: true,
    qualities: [75, 85, 90],
    imageSizes: [
      16, 32, 48, 64, 96, 128, 256, 384, 480, 640, 800, 1024, 1280, 1600,
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    // ⭐ در development بهینه‌سازی غیرفعال می‌شه
    unoptimized: process.env.NODE_ENV === "development",
  },
  // ═══════════════════════════════════════════════════════════
  // 2. Rewrites - پروکسی API به WordPress
  // ═══════════════════════════════════════════════════════════
  async rewrites() {
    return [
      {
        source: "/api/wp/:path*",
        destination: `${process.env.NEXT_PUBLIC_WP_API_URL || "http://nextsafar.local/wp-json"}/:path*`,
      },
      {
        source: "/wp-content/:path*",
        destination: `${process.env.NEXT_PUBLIC_WP_URL || "http://nextsafar.local"}/wp-content/:path*`,
      },
    ];
  },

  // ═══════════════════════════════════════════════════════════
  // 3. Security Headers
  // ═══════════════════════════════════════════════════════════
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },

  // ═══════════════════════════════════════════════════════════
  // 4. تنظیمات Experimental
  // ═══════════════════════════════════════════════════════════
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
    optimizePackageImports: ["lucide-react", "date-fns"],
  },

  // ═══════════════════════════════════════════════════════════
  // 5. ⭐ Turbopack Configuration (رفع خطا)
  // ═══════════════════════════════════════════════════════════
  turbopack: {},

  // ═══════════════════════════════════════════════════════════
  // 6. تنظیمات عمومی
  // ═══════════════════════════════════════════════════════════
  poweredByHeader: false,
};

module.exports = nextConfig;
