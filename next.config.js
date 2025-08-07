const nextConfig = {
  poweredByHeader: false,
  compress: true,

  productionBrowserSourceMaps: true, // ✅ Enables readable error stack traces in production

  experimental: {
    serverComponentsExternalPackages: ["next-auth"],
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      '@tanstack/react-query',
      'next-intl'
    ],
    swcMinify: true,
    workerThreads: false,
  },

  // ✅ ignore every TS error
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ ignore every ESLint error
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    remotePatterns: [
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  }
};

const withNextIntl = require("next-intl/plugin")("./i18n.ts");
module.exports = withNextIntl(nextConfig);
