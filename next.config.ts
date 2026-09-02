import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Альбомы: фото до 10 МБ, видеофрагменты до 50 МБ
  experimental: {
    serverActions: {
      bodySizeLimit: "52mb",
      // Свой домен за прокси Timeweb — иначе Server Actions могут падать в браузере
      allowedOrigins: ["clubrv.ru", "www.clubrv.ru"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "clubrv.ru",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "www.clubrv.ru",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async rewrites() {
    const prefixes = [
      "rest/v1",
      "auth/v1",
      "storage/v1",
      "realtime/v1",
      "functions/v1",
      "graphql/v1",
    ];
    return prefixes.map((prefix) => ({
      source: `/${prefix}/:path*`,
      destination: `/api/sb/${prefix}/:path*`,
    }));
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
