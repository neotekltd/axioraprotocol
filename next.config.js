/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // The public marketing page moved so no public route twins an
      // authenticated /app/* segment (twin segments confused route
      // resolution in the deployed bundle and crashed /app/referrals).
      { source: '/referrals', destination: '/referral-program', permanent: true },
    ];
  },
};

module.exports = nextConfig;
