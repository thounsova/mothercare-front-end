import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // You can either use `domains` for simple hostnames:
    domains: ["encrypted-tbn0.gstatic.com", "localhost"],

    // Or use `remotePatterns` for full control (protocol, port, path):
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
