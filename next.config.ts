import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  devIndicators: false,
  // Use the TypeScript API and threads where child-process spawning is restricted.
  experimental: { useTypeScriptCli: false, workerThreads: true },
};

export default nextConfig;
