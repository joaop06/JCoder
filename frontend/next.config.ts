import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        // port: '8081',
        pathname: '/api/v1/applications/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        // port: '8081',
        pathname: '/api/v1/images/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/api/v1/applications/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/api/v1/images/**',
      },
    ],
  },
};

export default nextConfig;
