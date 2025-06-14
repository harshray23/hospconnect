
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
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
  webpack: (config, { isServer, webpack }) => { // Added webpack to params
    // Ignore optional Jaeger exporter for OpenTelemetry if not found
    // This helps prevent "Module not found" errors during build for optional dependencies
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /@opentelemetry\/exporter-jaeger/,
      })
    );
    // You could also add IgnorePlugin for other optional OpenTelemetry exporters if they cause issues:
    // new webpack.IgnorePlugin({ resourceRegExp: /@opentelemetry\/exporter-otlp-grpc/ }),
    // new webpack.IgnorePlugin({ resourceRegExp: /@opentelemetry\/exporter-otlp-http/ }),

    if (!isServer) {
      // For client-side bundle, use pre-compiled handlebars and mock 'fs' and 'path'
      config.resolve.alias = {
        ...config.resolve.alias,
        'handlebars': 'handlebars/dist/handlebars.min.js',
      };
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
