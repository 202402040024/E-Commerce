import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Allow all external image domains
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
    // Fallback for any invalid images
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001'],
    },
  },
};

export default nextConfig;
