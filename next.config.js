/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    BITQUERY_API_KEY: process.env.BITQUERY_API_KEY,
  },
};

module.exports = nextConfig;
