/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Adjust as needed for your environment
  typescript: {
    // !! WARN !!
    // Ignoring type checking for development speed
    // Make sure to run type checking before production
    ignoreBuildErrors: true,
  },
  eslint: {
    // !! WARN !!
    // Ignoring ESLint errors for development speed
    // Make sure to fix ESLint errors before production
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 