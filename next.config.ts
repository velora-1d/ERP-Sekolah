import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },

  // Next.js 16+: top-level (not under experimental). Shrinks Worker bundle on Cloudflare.
  outputFileTracingExcludes: {
    "*": ["node_modules/next/dist/compiled/@vercel/og/**/*"],
  },

  serverExternalPackages: ["pg", "jsonwebtoken", "cloudinary"],

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },
};

// Hanya untuk lokal + `next dev`. Jangan jalan saat `next build` (Vercel/CI): itu memuat workerd
// (GLIBC baru) dan memicu error seperti "GLIBC_2.35 not found" / EPIPE.
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

export default nextConfig;
