// ./frontend/next.config.js

/** @type {import('next').NextConfig} */

const nextConfig = {
  port: 4400,
  experimental: {
    appDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '4500',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 's3.zenkai.com.vn',
      }
    ],
  },
}

module.exports = nextConfig
