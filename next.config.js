/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')()
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.coindesk.com',
      },
    ],
  },
}

module.exports = withNextIntl(nextConfig)
