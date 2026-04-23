import type { NextConfig } from "next";

const backendBaseUrl = process.env.VPS_BACKEND_BASE_URL?.trim().replace(/\/$/, "");

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    if (!backendBaseUrl) {
      return [];
    }

    return [
      {
        source: "/api/vps/:path*",
        destination: `${backendBaseUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
