/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ssl.gstatic.com', 'fonts.gstatic.com'],
  },
  outputFileTracingRoot: __dirname,
}

module.exports = nextConfig
