import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: ".",
  },
  // Giảm memory usage
  webpack: (config, { isServer }) => {
    return config;
  },
  experimental: {
    // Tắt optimizations không cần thiết
    optimizePackageImports: ["@solana/web3.js"],
  },
};

export default nextConfig;
