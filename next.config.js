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
        hostname: '**.cointelegraph.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: '**.images.cointelegraph.com',
        port: '',
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
      {
        protocol: 'https',
        hostname: 'storage.bsc.news',
      },
      {
        protocol: 'https',
        hostname: 'images.cryptodaily.co.uk'
      },
      {
        protocol: 'https',
        hostname: 'app.chainwire.org'
      }
    ],
  },
}

module.exports = withNextIntl(nextConfig)
