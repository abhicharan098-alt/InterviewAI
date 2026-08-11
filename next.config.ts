import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Cloudflare tunnel (and similar) to access dev resources
  allowedDevOrigins: [
    "purchase-accuracy-schools-yet.trycloudflare.com",
    "*.trycloudflare.com",
    "*.ngrok-free.dev",
    "*.ngrok.app",
  ],
  async redirects() {
    return [
      {
        source: "/InterviewAI",
        destination: "/",
        permanent: false,
      },
      {
        source: "/interviewai",
        destination: "/",
        permanent: false,
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cabelochave.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
