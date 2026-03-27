import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow serving uploaded files from /uploads
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
