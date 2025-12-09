import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use webpack instead of turbopack for local package support
  experimental: {
    // Turbopack has issues with local file: packages
  },
  transpilePackages: ['adamo-core', 'adamo-react'],
};

export default nextConfig;
