import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/applications/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/applications/**',
      },
    ],
  },
};

export default nextConfig;
