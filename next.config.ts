import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    cpus: 4,
  },
};

export default nextConfig;
