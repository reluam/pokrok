/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.sanity.io'],
  },
  i18n: {
    locales: ['cs', 'en'],
    defaultLocale: 'cs',
    localeDetection: false,
  },
}

module.exports = nextConfig
