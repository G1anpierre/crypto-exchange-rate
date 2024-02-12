/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')()
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.coindesk.com',
      },
      {
        protocol: 'https',
        hostname: 'images.cointelegraph.com',
      },
      {
        protocol: 'https',
        hostname: 'uploads-ssl.webflow.com',
      },
      {
        protocol: 'https',
        hostname: 'cointelegraph.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.decrypt.co',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jwplayer.com',
      },
      {
        protocol: 'https',
        hostname: 'bitcoinist.com',
      },
      {
        protocol: 'https',
        hostname: 'i.guim.co.uk',
      },
    ],
  },
}

module.exports = withNextIntl(nextConfig)
