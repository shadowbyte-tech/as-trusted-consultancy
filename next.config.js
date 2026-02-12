/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.vercel.com',
        port: '',
        pathname: '/image/upload/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.itsfoss.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Exclude problematic AI modules during build
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@genkit-ai/core': 'commonjs @genkit-ai/core',
        'genkit': 'commonjs genkit',
      });
    }
    return config;
  },
};

module.exports = nextConfig;