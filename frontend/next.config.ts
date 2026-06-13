import type { NextConfig } from 'next';

const isCapacitor = process.env.CAPACITOR_BUILD === 'true';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isCapacitor
    ? {
        output: 'export' as const,
        images: { unoptimized: true },
      }
    : {
        async rewrites() {
          return [
            {
              source: '/api/:path*',
              destination: 'http://localhost:8000/api/:path*',
            },
          ];
        },
      }),
};

export default nextConfig;
