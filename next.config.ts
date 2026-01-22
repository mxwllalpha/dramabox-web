import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // ===========================================
  // Image Optimization for Vercel
  // ===========================================
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imgcdnmi.dramaboxdb.com",
      },
      {
        protocol: "https",
        hostname: "hwztchapter.dramaboxdb.com",
      },
    ],
    // Enable Vercel's Image Optimization
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // ===========================================
  // Compiler Options for Vercel Edge
  // ===========================================
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // ===========================================
  // Experimental Features for Vercel
  // ===========================================
  experimental: {
    // Optimize CSS extraction for Vercel Edge
    optimizeCss: true,
    // Enable optimized package imports
    optimizePackageImports: [
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "@radix-ui/react-tooltip",
      "lucide-react",
    ],
  },

  // ===========================================
  // Vercel Edge Runtime Configuration
  // ===========================================
  // Force Edge Runtime for specific routes
  async rewrites() {
    return [
      {
        source: "/api/dramabox/:path*",
        destination: "/api/dramabox/:path*",
      },
    ];
  },

  // ===========================================
  // Bundle Optimization for Vercel
  // ===========================================
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size for Vercel deployment
    if (!dev && !isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Optimize for Vercel Edge
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk for React and Next.js
          framework: {
            name: "framework",
            chunks: "all",
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|props)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // Vendor chunk for Radix UI
          lib: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
            name: "lib",
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          // Vendor chunk for TanStack Query
          TanStack: {
            test: /[\\/]node_modules[\\/](@tanstack)[\\/]/,
            name: "tanstack",
            priority: 25,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: "commons",
            chunks: "all",
            minChunks: 2,
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      },
    };

    return config;
  },

  // ===========================================
  // Compression for Vercel
  // ===========================================
  compress: true,

  // ===========================================
  // Power-by header for monitoring
  // ===========================================
  poweredByHeader: false,

  // ===========================================
  // Generate ETags for caching
  // ===========================================
  generateEtags: true,

  // ===========================================
  // Production source maps (disabled for smaller bundles)
  // ===========================================
  productionBrowserSourceMaps: false,

  // ===========================================
  // Optimize output for Vercel Edge
  // ===========================================
  output: "standalone",

  // ===========================================
  // Logging configuration
  // ===========================================
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default withBundleAnalyzer(nextConfig);
