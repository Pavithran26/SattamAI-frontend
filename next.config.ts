import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      // Set root to current directory (sattam)
      root: process.cwd(),
    },
  },
};

export default nextConfig;