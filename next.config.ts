import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: ".",
    resolveAlias: {
      "@": "./app",
    },
  },
  // Giảm memory usage cho Turbopack
  webpack: (config: unknown, { isServer }: { isServer?: boolean }) => {
    // Optimize webpack config
    if (isServer && typeof config === "object" && config !== null) {
      const cfg = config as Record<string, unknown>;
      cfg.optimization = {
        ...(cfg.optimization as Record<string, unknown>),
        usedExports: true,
        sideEffects: false,
      };
    }
    return config;
  },
  experimental: {
    // Optimize imports
    optimizePackageImports: ["@solana/web3.js", "@coral-xyz/anchor"],
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
};

export default nextConfig;
