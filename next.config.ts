import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    optimizePackageImports: ["lucide-react", "leaflet"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;

