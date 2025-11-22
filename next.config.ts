import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "aig-academics.s3.ap-southeast-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },

  // Fix Turbopack error → empty turbopack config
  turbopack: {},
};

export default nextConfig;
