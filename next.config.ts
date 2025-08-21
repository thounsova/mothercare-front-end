import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Simple hostnames
    domains: ["encrypted-tbn0.gstatic.com", "localhost", "res.cloudinary.com"],

    // Remote patterns for more control
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**", // Strapi local uploads
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/dxzz4aybz/**", // Your Cloudinary folder
      },
    ],
  },
};

export default nextConfig;
