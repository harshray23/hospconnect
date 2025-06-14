
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Ignore optional Jaeger exporter for OpenTelemetry if not found
    config.resolve.alias['@opentelemetry/exporter-jaeger'] = false;

    if (!isServer) {
      // For client-side bundle, use pre-compiled handlebars and mock 'fs' and 'path'
      config.resolve.alias['handlebars'] = 'handlebars/dist/handlebars.min.js';
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    return config;
  },
};

export default nextConfig;
