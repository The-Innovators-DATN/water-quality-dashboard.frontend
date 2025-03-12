import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard/water',
        permanent: true,
      },
      {
        source: '/dashboard',
        destination: '/dashboard/water',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
