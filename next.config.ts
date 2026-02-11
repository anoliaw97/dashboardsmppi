import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/dashboardsmppi",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
