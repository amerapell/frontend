import type { NextConfig } from "next";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  images: {
    // When a Cloudinary cloud is configured, next/image delegates resizing to Cloudinary.
    ...(cloudName ? { loader: "custom" as const, loaderFile: "./src/lib/cloudinary-loader.ts" } : {}),
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "placehold.co" },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // First-party API: the browser calls /api/v1/* on this origin and Vercel proxies it to Railway, so the
  // httpOnly refresh cookie (ap_rt) is set on the shop's own domain instead of being a third-party cookie.
  async rewrites() {
    return apiUrl ? [{ source: "/api/v1/:path*", destination: `${apiUrl}/api/v1/:path*` }] : [];
  },
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
