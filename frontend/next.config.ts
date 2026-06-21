import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["ogl", "three", "motion"],
};

export default nextConfig;
