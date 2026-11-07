import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { formats: ['image/avif', 'image/webp'] },
  serverExternalPackages: ['firebase-admin'],
  async rewrites() {
    return [{ source: '/admin.html', destination: '/admin' }];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://api.razorpay.com")' },
        ],
      },
      ...['/admin', '/admin.html', '/api/admin/:path*'].map((source) => ({
        source,
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      })),
    ];
  },
};

export default nextConfig;
