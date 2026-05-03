import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // ⚠️ Build will succeed even if there are TS errors
    ignoreBuildErrors: true,
  },

  // eslint: {
  //   // ⚠️ Build will succeed even if there are ESLint errors
  //   ignoreDuringBuilds: true,
  // }
};

export default nextConfig;
