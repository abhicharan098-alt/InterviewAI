import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfjs-dist probes for @napi-rs/canvas at runtime via createRequire; keep it
  // as an external (never bundled) native module on the serverless runtime.
  serverExternalPackages: ["@napi-rs/canvas"],
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
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
