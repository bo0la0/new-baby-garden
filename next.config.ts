/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Only compile what's needed
  experimental: {
    optimizePackageImports: ['react', 'react-dom'],
  },
};

module.exports = nextConfig;