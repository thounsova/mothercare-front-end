/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "energized-fireworks-cc618580b1.media.strapiapp.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
