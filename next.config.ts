import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: "/home/node/.openclaw/workspace/blazr-app",
  },
};

export default nextConfig;
