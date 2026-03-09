import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@vivipractice/ui", "@vivipractice/types"],
  experimental: {
    optimizePackageImports: ["@vivipractice/ui"],
  },
};

export default nextConfig;
