/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // sanitize-html (and its htmlparser2 dep) are ESM-only; keep them external
    // so webpack doesn't try to bundle them into server components.
    serverComponentsExternalPackages: ['sanitize-html', 'htmlparser2'],
  },
  async redirects() {
    return [
      { source: '/markets', destination: '/crypto', permanent: true },
    ];
  },
};
module.exports = nextConfig;
