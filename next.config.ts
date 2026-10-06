import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep unrelated lockfiles in parent folders outside this project's build.
  turbopack: { root: process.cwd() },
};

export default nextConfig;
